<template>
  <div>
    <!-- Поиск по имени и городу -->
    <input v-model="searchQuery" @input="fetchData" placeholder="Поиск...">

    <!-- Фильтрация по статусу -->
    <select v-model="statusFilter" @change="fetchData">
      <option value="">Все статусы</option>
      <option value="новая">Новая</option>
      <option value="в работе">В работе</option>
      <option value="одобрена">Одобрена</option>
      <option value="отклонена">Отклонена</option>
    </select>

    <!-- Таблица с данными -->
    <table>
      <thead>
      <tr>
        <th @click="sortData('created_at')">Дата создания</th>
        <th @click="sortData('name')">Имя партнера</th>
        <th>Телефон</th>
        <th>Город</th>
        <th>Статус</th>
        <th>Комментарий</th>
        <th>Действия</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in paginatedApplications" :key="item.id">
        <td>{{ item.created_at }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.phone }}</td>
        <td>{{ item.city }}</td>
        <td>
          <select v-model="item.status" @change="updateStatus(item)">
            <option value="новая">Новая</option>
            <option value="в работе">В работе</option>
            <option value="одобрена">Одобрена</option>
            <option value="отклонена">Отклонена</option>
          </select>
        </td>
        <td>{{ item.comment }}</td>
        <td><button @click="editItem(item)">Изменить</button></td>
      </tr>
      </tbody>
    </table>

    <!-- Пагинация -->
    <div>
      <button @click="changePage(page - 1)" :disabled="page <= 1">Предыдущая</button>
      <span>Страница {{ page }}</span>
      <button @click="changePage(page + 1)">Следующая</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      applications: [],
      page: 1,
      pageSize: 5,
      searchQuery: '',
      statusFilter: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    };
  },
  computed: {
    filteredApplications() {
      let filtered = this.applications;

      // Фильтрация по имени, городу и статусу
      if (this.searchQuery) {
        filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            item.city.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }

      if (this.statusFilter) {
        filtered = filtered.filter(item => item.status === this.statusFilter);
      }

      return filtered;
    },
    paginatedApplications() {
      const start = (this.page - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.sortedApplications.slice(start, end);
    },
    sortedApplications() {
      let sorted = [...this.filteredApplications];
      if (this.sortBy === 'created_at') {
        sorted = sorted.sort((a, b) => {
          return this.sortOrder === 'desc'
              ? new Date(b.created_at) - new Date(a.created_at)
              : new Date(a.created_at) - new Date(b.created_at);
        });
      } else if (this.sortBy === 'name') {
        sorted = sorted.sort((a, b) => {
          return this.sortOrder === 'desc'
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
        });
      }
      return sorted;
    }
  },
  methods: {
    fetchData() {
      axios.get('http://localhost:3000/applications', {
        params: {
          _page: this.page,          // Параметры для пагинации
          _limit: this.pageSize,     // Лимит на количество заявок
          name_like: this.searchQuery, // Для поиска по имени
          city_like: this.searchQuery, // Для поиска по городу
          status: this.statusFilter,   // Фильтрация по статусу
        }
      })
          .then(response => {
            // Перезаписываем данные при получении нового ответа
            this.applications = response.data;
          })
          .catch(error => {
            console.error('Ошибка при получении данных:', error);
          });
    },
    sortData(field) {
      if (this.sortBy === field) {
        this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
      } else {
        this.sortBy = field;
        this.sortOrder = 'desc';
      }
    },
    updateStatus(item) {
      axios.put(`http://localhost:3000/applications/${item.id}`, item)
          .then(() => {
            this.fetchData(); // Обновляем данные после изменения статуса
          })
          .catch(error => {
            console.error('Ошибка обновления статуса:', error);
          });
    },
    changePage(newPage) {
      this.page = newPage;
      this.fetchData();
    },
    editItem(item) {
      console.log(item)
      // Реализуй логику для редактирования заявки
    }
  },
  created() {
    this.fetchData();
  }
};
</script>

<style scoped>
/* Стили для таблицы и других элементов */
</style>
