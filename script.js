
let data = {
  components: [],
  current_smu: {}
};

function showMenu(menu) {
  document.getElementById('monitoring').style.display = menu === 'monitoring' ? 'block' : 'none';
  document.getElementById('smu').style.display = menu === 'smu' ? 'block' : 'none';
}

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

function updateSMU(event) {
  event.preventDefault();
  const equipment = document.getElementById('equipmentInput').value;
  const smu = parseInt(document.getElementById('smuInput').value);
  data.current_smu[equipment] = smu;
  data.components.forEach(c => {
    if (c.equipment === equipment) {
      c.smu = smu;
    }
  });
  renderTable();
}

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
        <td><button onclick="saveComponent(${index})">Save</button></td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function editComponent(index, field, value) {
  data.components[index][field] = value;
  renderTable();
}

function uploadFoto(index, input) {
  const file = input.files[0];
  if (file) {
    data.components[index].foto = file.name;
  }
}

function saveComponent(index) {
  console.log("Component saved:", data.components[index]);
}

async function saveToGitHubFile() {
  const token = "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"; // Ganti dengan token kamu
  const owner = "endboedy"; // Ganti dengan username GitHub kamu
  const repo = "EM-Compoenent"; // Ganti dengan nama repo kamu
  const path = "data.json";

  const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
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
  console.log("GitHub update result:", result);
  alert("✅ Data berhasil disimpan ke GitHub!");
}

renderTable();
