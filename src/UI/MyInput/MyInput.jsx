import React from 'react'
import style from './MyInput.module.css';

function MyInput({ type, placeholder, icon, required, value, onChange}) {
    return (
        <div className={style.inputBox}>
            <input type={type} placeholder={placeholder} value={value} onChange={onChange} required={required}/>
            {icon}
        </div>
    )
}

export default MyInput
