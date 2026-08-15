import React from 'react';
import StudentForm from '../components/StudentForm';

export default function PublicPage({ scholarshipTypes }) {
  return (
    <div className="container mx-auto px-4 py-6">
      <StudentForm scholarshipTypes={scholarshipTypes} />
    </div>
  );
}