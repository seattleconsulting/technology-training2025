"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const bookList = {
  sidebarTitle: "MT書籍管理",
  subTitle: "メニュー",
  add: "貸出登録",
  rentalEdit: "貸出編集",
  bookList: "書籍一覧",
  edit: "編集",
  bookName: "書籍名",
  isbn: "ISBN",
  employeeId: "社員番号",
  password: "パスワード",
  login: "ログイン",
};

const FormField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
}) => (
  <div style={{ marginBottom: "15px" }}>
    <label style={{ color: "gray", display: "block", marginBottom: "5px" }}>
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "8px",
        borderRadius: "5px",
        border: "1px solid #ccc",
      }}
    />
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeId: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.employeeId && formData.password) {
      navigate("/List/bookList");
    } else {
      alert("社員番号とパスワードを入力してください");
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <form
        onSubmit={handleLogin}
        style={{
          width: "300px",
          padding: "2rem",
          border: "1px solid #ccc",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "20px", color: "gray" }}>
          {bookList.login}
        </h1>

        <FormField
          label={bookList.employeeId}
          name="employeeId"
          value={formData.employeeId}
          onChange={handleChange}
          placeholder="社員番号を入力"
        />

        <FormField
          label={bookList.password}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="パスワードを入力"
        />

        <button
          type="submit"
          style={{
            backgroundColor: "green",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            width: "100%",
            textAlign: "center",
          }}
        >
          {bookList.login}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;