// Importasi elemen-elemen HTML
const form = document.getElementById('patient-form');
const patientList = document.getElementById('patient-list');
const searchInput = document.getElementById('search');
const submitButton = document.getElementById('submit-button');

// Inisialisasi data pasien
let patients = JSON.parse(localStorage.getItem('patients')) || [];
let editIndex = null; // null means add mode; otherwise edit mode

// Set max date untuk input tanggal lahir
const birthdateInput = document.getElementById('birthdate');
birthdateInput.max = new Date().toISOString().split('T')[0];

// Fungsi untuk menghitung umur berdasarkan tanggal lahir
function calculateAge(birthdate) {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Fungsi untuk menampilkan data pasien yang difilter berdasarkan input pencarian
function renderPatients() {
  const filter = searchInput.value.trim().toLowerCase();
  patientList.innerHTML = '';

  const filteredPatients = patients.filter(p => {
    return (
      p.name.toLowerCase().includes(filter) ||
      p.rmNumber.toLowerCase().includes(filter) ||
      p.birthplace.toLowerCase().includes(filter) ||
      new Date(p.birthdate).toLocaleDateString('id-ID').includes(filter) ||
      p.gender.toLowerCase().includes(filter) ||
      p.medicine.toLowerCase().includes(filter)
    );
  });

  if (filteredPatients.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 8;
    td.style.textAlign = 'center';
    td.style.fontStyle = 'italic';
    td.textContent = filter ? 'Tidak ditemukan data pasien yang cocok' : 'Belum ada data pasien';
    tr.appendChild(td);
    patientList.appendChild(tr);
    return;
  }

  filteredPatients.forEach((patient, index) => {
    const actualIndex = patients.indexOf(patient);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${patient.name}</td>
      <td>${patient.rmNumber}</td>
      <td>${patient.birthplace}</td>
      <td>${new Date(patient.birthdate).toLocaleDateString('id-ID')}</td>
      <td>${calculateAge(patient.birthdate)}</td>
      <td>${patient.gender}</td>
      <td>${patient.medicine}</td>
      <td class="last-col">
        <button class="action-btn edit" data-index="${actualIndex}" aria-label="Edit data pasien ${patient.name}">Edit</button>
        <button class="action-btn delete" data-index="${actualIndex}" aria-label="Hapus data pasien ${patient.name}">Hapus</button>
      </td>
    `;
    patientList.appendChild(tr);
  });
}

// Fungsi untuk menyimpan data pasien ke localStorage
function savePatients() {
  localStorage.setItem('patients', JSON.stringify(patients));
}

// Fungsi untuk mengisi form dengan data pasien
function fillForm(patient) {
  form.name.value = patient.name;
  form['rm-number'].value = patient.rmNumber;
  form.birthplace.value = patient.birthplace;
  form.birthdate.value = patient.birthdate;
  // set gender radio buttons
  [...form.gender].forEach(radio => {
    radio.checked = radio.value === patient.gender;
  });
  form.medicine.value = patient.medicine;
}

// Fungsi untuk mengatur form ke mode tambah
function resetForm() {
  form.reset();
  editIndex = null;
  submitButton.textContent = "Tambah Pasien";
}

// Event listener untuk form submit
form.addEventListener('submit', e => {
  e.preventDefault();

  const name = form.name.value.trim();
  const rmNumber = form['rm-number'].value.trim();
  const birthplace = form.birthplace.value.trim();
  const birthdate = form.birthdate.value;
  const gender = form.gender.value;
  const medicine = form.medicine.value.trim();

  if (editIndex === null) {
    // Add new
    patients.push({ name, rmNumber, birthplace, birthdate, gender, medicine });
  } else {
    // Edit existing
    patients[editIndex] = { name, rmNumber, birthplace, birthdate, gender, medicine };
  }
  savePatients();
  renderPatients();
  resetForm();
  form.name.focus();
});

// Event listener untuk tombol edit dan hapus
patientList.addEventListener('click', e => {
  if (e.target.classList.contains('edit')) {
    const index = parseInt(e.target.dataset.index, 10);
    if (!isNaN(index)) {
      editIndex = index;
      fillForm(patients[index]);
      submitButton.textContent = "Simpan Perubahan";
      window.scrollTo({ top: 0, behavior: 'smooth' });
      form.name.focus();
    }
  } else if (e.target.classList.contains('delete')) {
    const index = parseInt(e.target.dataset.index, 10);
    if (!isNaN(index)) {
      const confirmed = confirm(`Apakah Anda yakin ingin menghapus data pasien "${patients[index].name}"?`);
      if (confirmed) {
        patients.splice(index, 1);
        savePatients();
        renderPatients();
        if (editIndex === index) {
          resetForm();
        }
      }
    }
  }
});

// Event listener untuk input pencarian
searchInput.addEventListener('input', () => {
  renderPatients();
});

// Render data pasien pada awal
renderPatients();
