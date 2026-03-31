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

    <application-modal
      v-if="showModal"
      :application="selectedApplication"
      :saving="saving"
      @save="saveCard"
      @close="closeModal"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import ApplicationModal from './components/ApplicationModal.vue'

export default {
  name: 'App',

  components: { ApplicationModal },

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
      selectedApplication: null,
      saving: false,
    }
  },

  computed: {
    ...mapState(['applications', 'total', 'loading', 'error']),

    paginatedItems() {
      return this.applications
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.total / this.pageSize))
    },
  },

  watch: {
    statusFilter() {
      this.page = 1
      this.loadData()
    },
    async sortBy() {
      await this.loadData()
    },
    async sortOrder() {
      await this.loadData()
    },
    async page() {
      await this.loadData()
    },
  },

  methods: {
    ...mapActions(['fetchApplications', 'updateApplication']),

    async loadData() {
      const params = {
        _page: this.page,
        _limit: this.pageSize,
        _sort: this.sortBy,
        _order: this.sortOrder,
      }
      if (this.debouncedSearch) params.q = this.debouncedSearch
      if (this.statusFilter) params.status = this.statusFilter
      await this.fetchApplications(params)
    },

    onSearchInput() {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        this.debouncedSearch = this.searchQuery
        this.page = 1
        this.loadData()
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
      this.selectedApplication = { ...item }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.selectedApplication = null
    },

    async saveCard(form) {
      this.saving = true
      try {
        await this.updateApplication(form)
        this.closeModal()
      } catch {
        alert('Ошибка при сохранении')
      } finally {
        this.saving = false
      }
    },
  },

  async created() {
    await this.loadData()
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
</style>
