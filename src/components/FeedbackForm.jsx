// src/components/FeedbackForm.jsx
import { useState } from "react";
import "./FeedbackForm.css";

const MAX_MESSAGE = 500; // Задание 1: максимальная длина сообщения

// Задание 2: маска телефона +7 (XXX) XXX-XX-XX.
// Оставляем только цифры, отбрасываем код страны (7 или 8) и расставляем разделители.
const formatPhone = (raw) => {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("7") || digits.startsWith("8")) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);

  if (!digits) return "";

  let result = "+7 (" + digits.slice(0, 3);
  if (digits.length > 3) result += ") " + digits.slice(3, 6);
  if (digits.length > 6) result += "-" + digits.slice(6, 8);
  if (digits.length > 8) result += "-" + digits.slice(8, 10);
  return result;
};

function FeedbackForm() {
  // --- Значения полей (управляемые компоненты) ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  // Задание 3: переключатель «Хочу получить ответ»
  const [wantReply, setWantReply] = useState(false);

  // --- Ошибки валидации (null = ошибки нет) ---
  const [errors, setErrors] = useState({
    name: null,
    email: null,
    phone: null,
    message: null,
  });

  // --- «Тронутые» поля ---
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    message: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Все значения в одном объекте — удобно обращаться по имени поля.
  const values = { name, email, phone, message };

  // --- Функции валидации ---
  const validateName = (value) => {
    if (!value.trim()) return "Имя обязательно для заполнения";
    if (value.trim().length < 2) return "Минимум 2 символа";
    if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(value.trim()))
      return "Только буквы, пробелы и дефис";
    return null;
  };

  // Задание 3: email обязателен только если включён чекбокс.
  // required передаём параметром, чтобы использовать актуальное значение.
  const validateEmail = (value, required = wantReply) => {
    if (!value.trim()) {
      return required ? "Email обязателен для получения ответа" : null;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
      return "Некорректный формат email";
    return null;
  };

  // Задание 2: проверка формата телефона.
  const validatePhone = (value) => {
    if (!value.trim()) return "Телефон обязателен для заполнения";
    if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value))
      return "Формат: +7 (XXX) XXX-XX-XX";
    return null;
  };

  // Задание 1: учитываем верхний лимит.
  const validateMessage = (value) => {
    if (!value.trim()) return "Сообщение обязательно для заполнения";
    if (value.trim().length < 10) return "Минимум 10 символов";
    if (value.length > MAX_MESSAGE)
      return `Максимум ${MAX_MESSAGE} символов`;
    return null;
  };

  const validators = {
    name: validateName,
    email: (value) => validateEmail(value),
    phone: validatePhone,
    message: validateMessage,
  };

  // --- Изменение поля (live-валидация) ---
  const handleChange = (field, rawValue) => {
    let value = rawValue;

    switch (field) {
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "phone":
        value = formatPhone(rawValue); // применяем маску
        setPhone(value);
        break;
      case "message":
        setMessage(value);
        break;
      default:
        break;
    }

    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validators[field](value),
      }));
    }
  };

  // Задание 3: при переключении чекбокса пересчитываем правило для email.
  const handleToggleReply = (checked) => {
    setWantReply(checked);
    if (touched.email) {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(email, checked),
      }));
    }
  };

  // --- Потеря фокуса ---
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validators[field](values[field]),
    }));
  };

  // --- Отправка формы ---
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {
      name: validateName(name),
      email: validateEmail(email),
      phone: validatePhone(phone),
      message: validateMessage(message),
    };

    setErrors(newErrors);
    setTouched({ name: true, email: true, phone: true, message: true });

    if (Object.values(newErrors).some((err) => err !== null)) {
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  // --- Классы инпута в зависимости от состояния ---
  const getInputClass = (field) => {
    const classes = ["field__input"];

    if (touched[field] && errors[field]) {
      classes.push("field__input--error");
    } else if (touched[field] && !errors[field] && values[field].trim()) {
      // Зелёная рамка только если поле не пустое
      // (необязательный пустой email не подсвечиваем как «успех»).
      classes.push("field__input--valid");
    }

    if (field === "message") {
      classes.push("field__input--textarea");
    }

    return classes.join(" ");
  };

  // --- Экран после успешной отправки ---
  if (submitted) {
    return (
      <div className="feedback-form feedback-form--success">
        <h2 className="feedback-form__title">Спасибо за обращение!</h2>
        <p className="feedback-form__text">
          Мы свяжемся с вами в ближайшее время.
        </p>
        <button
          type="button"
          className="feedback-form__submit"
          onClick={() => {
            setName("");
            setEmail("");
            setPhone("");
            setMessage("");
            setWantReply(false);
            setErrors({ name: null, email: null, phone: null, message: null });
            setTouched({
              name: false,
              email: false,
              phone: false,
              message: false,
            });
            setSubmitted(false);
          }}
        >
          Отправить ещё одно сообщение
        </button>
      </div>
    );
  }

  return (
    <form className="feedback-form" onSubmit={handleSubmit} noValidate>
      {/* Поле «Имя» */}
      <div className="field">
        <label htmlFor="name" className="field__label">
          Имя
        </label>
        <input
          id="name"
          type="text"
          className={getInputClass("name")}
          value={name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
        />
        {touched.name && errors.name && (
          <span className="field__error">{errors.name}</span>
        )}
      </div>

      {/* Задание 2: поле «Телефон» */}
      <div className="field">
        <label htmlFor="phone" className="field__label">
          Телефон
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          placeholder="+7 (___) ___-__-__"
          className={getInputClass("phone")}
          value={phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          onBlur={() => handleBlur("phone")}
        />
        {touched.phone && errors.phone && (
          <span className="field__error">{errors.phone}</span>
        )}
      </div>

      {/* Задание 3: переключатель «Хочу получить ответ» */}
      <div className="field">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={wantReply}
            onChange={(e) => handleToggleReply(e.target.checked)}
          />
          <span>Хочу получить ответ</span>
        </label>
      </div>

      {/* Поле «Email» */}
      <div className="field">
        <label htmlFor="email" className="field__label">
          Email{wantReply ? " *" : ""}
        </label>
        <input
          id="email"
          type="email"
          className={getInputClass("email")}
          value={email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
        />
        {touched.email && errors.email && (
          <span className="field__error">{errors.email}</span>
        )}
      </div>

      {/* Поле «Сообщение» + Задание 1: счётчик символов */}
      <div className="field">
        <label htmlFor="message" className="field__label">
          Сообщение
        </label>
        <textarea
          id="message"
          className={getInputClass("message")}
          value={message}
          onChange={(e) => handleChange("message", e.target.value)}
          onBlur={() => handleBlur("message")}
          maxLength={MAX_MESSAGE}
          rows={5}
        />
        <div className="field__footer">
          {touched.message && errors.message ? (
            <span className="field__error">{errors.message}</span>
          ) : (
            <span />
          )}
          <span
            className={
              "field__counter" +
              (message.length >= MAX_MESSAGE ? " field__counter--limit" : "")
            }
          >
            {message.length} / {MAX_MESSAGE}
          </span>
        </div>
      </div>

      <button
        type="submit"
        className="feedback-form__submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Отправка…" : "Отправить"}
      </button>
    </form>
  );
}

export default FeedbackForm;