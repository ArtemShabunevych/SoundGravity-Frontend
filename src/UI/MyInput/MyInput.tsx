import React from 'react';
import style from './MyInput.module.css';

interface MyInputProps {
    type: 'text' | 'email' | 'password' | 'number' | 'tel';
    placeholder: string;
    icon?: React.ReactNode;
    required?: boolean;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function MyInput({ type, placeholder, icon, required = false, value, onChange }: MyInputProps) {
    return (
        <div className={style.inputBox}>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
            />
            {icon}
        </div>
    );
}

export default MyInput;