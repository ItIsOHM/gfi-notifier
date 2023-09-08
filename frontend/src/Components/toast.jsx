import React, { useState, useEffect } from 'react';
import './toast.css';

const Toast = ({ message, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
    const timer = setTimeout(() => {
        setVisible(false);
        onClose();
    }, 4000); 

    return () => clearTimeout(timer);
    }, [onClose]);

    return (
    <div className={`toast ${visible ? 'show' : ''}`}>
        {message}
    </div>
    );
};

export default Toast;