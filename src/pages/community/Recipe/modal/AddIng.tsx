import Select from 'react-select';

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

// npm install react-select
function App() {
  return (
    <div style={{ width: '300px', margin: '50px' }}>
      <Select options={options} isSearchable />
    </div>
  );
}