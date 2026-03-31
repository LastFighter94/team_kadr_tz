<template>
  <div class="overlay" @click.self="$emit('close')">
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
        <button class="btn btn-primary" @click="save" :disabled="saving">
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </button>
        <button class="btn" @click="$emit('close')">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApplicationModal',

  props: {
    application: {
      type: Object,
      required: true,
    },
    saving: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      form: { ...this.application },
      errors: {},
    }
  },

  methods: {
    validate() {
      const errors = {}
      if (!this.form.name?.trim()) errors.name = 'Обязательное поле'
      if (!this.form.phone?.trim()) errors.phone = 'Обязательное поле'
      if (!this.form.city?.trim()) errors.city = 'Обязательное поле'
      this.errors = errors
      return Object.keys(errors).length === 0
    },

    save() {
      if (!this.validate()) return
      this.$emit('save', { ...this.form })
    },
  },
}
</script>

<style scoped>
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
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
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