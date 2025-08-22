let data = {
  components: [],
  current_smu: {}
};

// ====== CONFIG ======
const token = "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"; // Personal Access Token GitHub
const owner = "endboedy";
const repo = "EM-Compoenent"; // Pastikan tidak typo
const path = "data.json";

// ====== MENU ======
function showMenu(menu) {
  document.getElementById('monitoring').style.display = menu === 'monitoring' ? 'block' : 'none';
  document.getElementById('smu').style.display = menu === 'smu' ? 'block' : 'none';
}

// ====== TAMBAH COMPONENT ======
function addNewComponent() {
  const newComponent = {
    equipment: "",
    model: "",
    smcs: "",
    component: "",
    freq: 0,
    cost: 0,
    change_out: 0,
    smu: 0,
    rating: "",
    foto: "",
    remarks: ""
  };
  data.components.push(newComponent);
  renderTable();
}

// ====== UPDATE SMU ======
function updateSMU(event) {
  event.preventDefault();
  const equipment = document.getElementById('equipmentInput').value;
  const smu = parseInt(document.getElementById('smuInput').value);
  data.current_smu[equipment] = smu;
  data.components.forEach(c => {
    if (c.equipment === equipment) c.smu = smu;
  });
  renderTable();
}

// ====== RENDER TABLE ======
function renderTable() {
  const tbody = document.querySelector("#componentTable tbody");
  tbody.innerHTML = "";
  data.components.forEach((c, index) => {
    const life = c.smu - c.change_out;
    const percent = c.freq > 0 ? ((life / c.freq) * 100).toFixed(2) : 0;
    const next_change = c.change_out + c.freq;
    const row = `
      <tr>
        <td><input value="${c.equipment}" onchange="editComponent(${index}, 'equipment', this.value)"></td>
        <td><input value="${c.model}" onchange="editComponent(${index}, 'model', this.value)"></td>
        <td><input value="${c.smcs}" onchange="editComponent(${index}, 'smcs', this.value)"></td>
        <td><input value="${c.component}" onchange="editComponent(${index}, 'component', this.value)"></td>
        <td><input type="number" value="${c.freq}" onchange="editComponent(${index}, 'freq', parseInt(this.value))"></td>
        <td><input type="number" value="${c.cost}" onchange="editComponent(${index}, 'cost', parseFloat(this.value))"></td>
        <td><input type="number" value="${c.change_out}" onchange="editComponent(${index}, 'change_out', parseInt(this.value))"></td>
        <td>${next_change}</td>
        <td>${c.smu}</td>
        <td>${life}</td>
        <td>${percent}%</td>
        <td><input value="${c.rating}" onchange="editComponent(${index}, 'rating', this.value)"></td>
        <td><input type="file" onchange="uploadFoto(${index}, this)"></td>
        <td><input value="${c.remarks}" onchange="editComponent(${index}, 'remarks', this.value)"></td>
        <td>
          <button onclick="saveComponent(${index})">Save</button>
          <button onclick="editComponent(${index})">Edit</button>
          <button onclick="deleteComponent(${index})">Delete</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// ====== EDIT COMPONENT ======
function editComponent(index, field, value) {
  if (field && value !== undefined) data.components[index][field] = value;
  renderTable();
}

// ====== DELETE COMPONENT ======
function deleteComponent(index) {
  if (confirm("Yakin ingin menghapus komponen ini?")) {
    data.components.splice(index, 1);
    renderTable();
  }
}

// ====== UPLOAD FOTO ======
function uploadFoto(index, input) {
  const file = input.files[0];
  if (file) data.components[index].foto = file.name;
}

// ====== SAVE COMPONENT ======
function saveComponent(index) {
  console.log("Component saved:", data.components[index]);
}

// ====== SAVE TO GITHUB ======
async function saveToGitHubFile() {
  try {
    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!getRes.ok) throw new Error(`GitHub GET error: ${getRes.status} ${getRes.statusText}`);

    const fileData = await getRes.json();
    const sha = fileData.sha;

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Update data.json via Component Life EM",
        content: content,
        sha: sha
      })
    });

    const result = await res.json();
    if (!res.ok) throw new Error(`GitHub PUT error: ${res.status} ${res.statusText}`);
    console.log("✅ GitHub update result:", result);
    alert("Data berhasil disimpan ke GitHub!");
  } catch (error) {
    console.error("❌ Gagal save ke GitHub:", error);
    alert(`Gagal save ke GitHub: ${error.message}`);
  }
}

// ====== LOAD FROM GITHUB ======
async function loadFromGitHubFile() {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });

    if (!res.ok) throw new Error(`GitHub GET error: ${res.status} ${res.statusText}`);

    const fileData = await res.json();
    if (fileData.content) {
      const decodedContent = atob(fileData.content.replace(/\n/g, ''));
      data = JSON.parse(decodedContent);
      renderTable();
      console.log("✅ Data berhasil dimuat dari GitHub");
    } else {
      console.warn("⚠️ File kosong atau tidak ditemukan di GitHub:", fileData);
      alert("Gagal load data. Pastikan file data.json ada di repo.");
    }
  } catch (error) {
    console.error("❌ Error saat load data:", error);
    alert(`Terjadi error saat load data: ${error.message}`);
  }
}

// ====== LOAD DATA SAAT HALAMAN DIBUKA ======
loadFromGitHubFile();
