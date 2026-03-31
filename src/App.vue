<template>
  <div id="app">
    <h1>Заявки партнёров</h1>

    <div v-if="loading" class="state-msg">Загрузка...</div>
    <div v-else-if="error" class="state-msg state-error">{{ error }}</div>

    <template v-else>
      <div class="controls">
        <input
          v-model="searchQuery"
          @input="onSearchInput"
          placeholder="Поиск по имени или городу..."
          class="search-input"
        />
        <select v-model="statusFilter" class="status-select">
          <option value="">Все статусы</option>
          <option value="новая">Новая</option>
          <option value="в работе">В работе</option>
          <option value="одобрена">Одобрена</option>
          <option value="отклонена">Отклонена</option>
        </select>
      </div>

      <div v-if="paginatedItems.length === 0" class="state-msg">Заявки не найдены</div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th class="sortable" @click="setSort('name')">
              Имя партнёра <span class="sort-icon">{{ sortIcon('name') }}</span>
            </th>
            <th>Город</th>
            <th>Статус</th>
            <th class="sortable" @click="setSort('created_at')">
              Дата создания <span class="sort-icon">{{ sortIcon('created_at') }}</span>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in paginatedItems"
            :key="item.id"
            class="table-row"
            @click="openCard(item)"
          >
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.city }}</td>
            <td>
              <span :class="['badge', statusClass(item.status)]">{{ item.status }}</span>
            </td>
            <td>{{ item.created_at }}</td>
            <td>
              <button class="btn" @click.stop="openCard(item)">Открыть</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="pagination">
        <button class="btn" @click="page--" :disabled="page <= 1">←</button>
        <span class="page-info">Страница {{ page }} из {{ totalPages }}</span>
        <button class="btn" @click="page++" :disabled="page >= totalPages">→</button>
      </div>
    </template>

    <!-- Модальная карточка заявки -->
    <div v-if="showModal" class="overlay" @click.self="closeModal">
      <div class="modal">
        <h2>Заявка #{{ form.id }}</h2>

        <div class="field">
          <label>Имя партнёра <span class="required">*</span></label>
          <input v-model="form.name" :class="{ 'input-error': errors.name }" />
          <p v-if="errors.name" class="error-text">{{ errors.name }}</p>
        </div>

        <div class="field">
          <label>Телефон <span class="required">*</span></label>
          <input v-model="form.phone" :class="{ 'input-error': errors.phone }" />
          <p v-if="errors.phone" class="error-text">{{ errors.phone }}</p>
        </div>

        <div class="field">
          <label>Город <span class="required">*</span></label>
          <input v-model="form.city" :class="{ 'input-error': errors.city }" />
          <p v-if="errors.city" class="error-text">{{ errors.city }}</p>
        </div>

        <div class="field">
          <label>Статус</label>
          <select v-model="form.status">
            <option value="новая">Новая</option>
            <option value="в работе">В работе</option>
            <option value="одобрена">Одобрена</option>
            <option value="отклонена">Отклонена</option>
          </select>
        </div>

        <div class="field">
          <label>Комментарий</label>
          <textarea v-model="form.comment" rows="3"></textarea>
        </div>

        <div class="field">
          <label>Дата создания</label>
          <span class="static-value">{{ form.created_at }}</span>
        </div>

        <div class="modal-actions">
          <button class="btn btn-primary" @click="saveCard" :disabled="saving">
            {{ saving ? 'Сохранение...' : 'Сохранить' }}
          </button>
          <button class="btn" @click="closeModal">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'App',

  data() {
    return {
      searchQuery: '',
      debouncedSearch: '',
      debounceTimer: null,
      statusFilter: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1,
      pageSize: 5,
      showModal: false,
      form: {},
      errors: {},
      saving: false,
    }
  },

  computed: {
    ...mapState(['applications', 'loading', 'error']),

    filteredItems() {
      let result = this.applications

      if (this.debouncedSearch) {
        const q = this.debouncedSearch.toLowerCase()
        result = result.filter(
          (a) => a.name.toLowerCase().includes(q) || a.city.toLowerCase().includes(q)
        )
      }

      if (this.statusFilter) {
        result = result.filter((a) => a.status === this.statusFilter)
      }

      return result
    },

    sortedItems() {
      return [...this.filteredItems].sort((a, b) => {
        let valA = a[this.sortBy]
        let valB = b[this.sortBy]

        if (this.sortBy === 'created_at') {
          valA = new Date(valA)
          valB = new Date(valB)
        } else {
          valA = valA.toLowerCase()
          valB = valB.toLowerCase()
        }

        if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1
        return 0
      })
    },

    paginatedItems() {
      const start = (this.page - 1) * this.pageSize
      return this.sortedItems.slice(start, start + this.pageSize)
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.filteredItems.length / this.pageSize))
    },
  },

  watch: {
    statusFilter() {
      this.page = 1
    },
  },

  methods: {
    ...mapActions(['fetchApplications', 'updateApplication']),

    onSearchInput() {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        this.debouncedSearch = this.searchQuery
        this.page = 1
      }, 400)
    },

    setSort(field) {
      if (this.sortBy === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortBy = field
        this.sortOrder = 'asc'
      }
    },

    sortIcon(field) {
      if (this.sortBy !== field) return '↕'
      return this.sortOrder === 'asc' ? '↑' : '↓'
    },

    statusClass(status) {
      const map = {
        'новая': 'badge-new',
        'в работе': 'badge-progress',
        'одобрена': 'badge-approved',
        'отклонена': 'badge-rejected',
        'завершена': 'badge-done',
      }
      return map[status] || ''
    },

    openCard(item) {
      this.form = { ...item }
      this.errors = {}
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.errors = {}
    },

    validate() {
      const errors = {}
      if (!this.form.name?.trim()) errors.name = 'Обязательное поле'
      if (!this.form.phone?.trim()) errors.phone = 'Обязательное поле'
      if (!this.form.city?.trim()) errors.city = 'Обязательное поле'
      this.errors = errors
      return Object.keys(errors).length === 0
    },

    async saveCard() {
      if (!this.validate()) return
      this.saving = true
      try {
        await this.updateApplication(this.form)
        this.closeModal()
      } catch {
        alert('Ошибка при сохранении')
      } finally {
        this.saving = false
      }
    },
  },

  created() {
    this.fetchApplications()
  },
}
</script>

<style scoped>
#app {
  font-family: Arial, sans-serif;
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}

h1 {
  margin-bottom: 20px;
  font-size: 22px;
}

/* Controls */
.controls {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.status-select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  min-width: 160px;
}

/* Table */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th,
.table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.table th {
  background: #f5f5f5;
  font-weight: 600;
  white-space: nowrap;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background: #ebebeb;
}

.sort-icon {
  font-size: 11px;
  color: #999;
}

.table-row:hover {
  background: #fafafa;
  cursor: pointer;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge-new      { background: #e3f2fd; color: #1565c0; }
.badge-progress { background: #fff8e1; color: #e65100; }
.badge-approved { background: #e8f5e9; color: #2e7d32; }
.badge-rejected { background: #fce4ec; color: #c62828; }
.badge-done     { background: #ede7f6; color: #4527a0; }

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.page-info {
  font-size: 14px;
  color: #555;
}

/* Buttons */
.btn {
  padding: 6px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s;
}

.btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.btn-primary {
  background: #1976d2;
  color: #fff;
  border-color: #1976d2;
}

.btn-primary:hover:not(:disabled) {
  background: #1565c0;
}

/* States */
.state-msg {
  padding: 40px;
  text-align: center;
  color: #888;
  font-size: 15px;
}

.state-error {
  color: #c62828;
}

/* Modal */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: #fff;
  border-radius: 8px;
  padding: 28px;
  width: 460px;
  max-width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}

.modal h2 {
  margin-bottom: 20px;
  font-size: 18px;
}

.field {
  margin-bottom: 14px;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: #1976d2;
}

.input-error {
  border-color: #c62828 !important;
}

.error-text {
  color: #c62828;
  font-size: 12px;
  margin: 4px 0 0;
}

.required {
  color: #c62828;
}

.static-value {
  font-size: 14px;
  color: #555;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
</style>
