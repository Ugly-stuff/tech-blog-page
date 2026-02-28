import React from 'react'
import { useNavigate } from 'react-router-dom'

const BackButton = ({ fallback = "/" }) => {
    const navigate = useNavigate();

    const goBack = () => {
        if (window.history.length > 1) {
            navigate(-1); // can use swipe back in browser
        } else{
            navigate(fallback); // safety fallback
        }
    };


  return (
    <button 
    onClick={goBack} className='text-sm-blue-600 mb-4'>
          ← Back
    </button>
  )
}

export default BackButton;