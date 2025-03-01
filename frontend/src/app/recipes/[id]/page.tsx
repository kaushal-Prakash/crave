"use client";
import { useParams } from 'next/navigation'
import React from 'react'

function page() {
    const {id} = useParams();
    console.log(id);
  return (
    <div className='min-h-screen flex justify-center items-center'>{id}</div>
  )
}

export default page