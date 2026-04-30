const yamlTypeSelect = document.getElementById('yaml-type');
const guiInterface = document.getElementById('gui-interface');
const yamlPreview = document.getElementById('yaml-preview');
const helpText = document.getElementById('help-text');

yamlTypeSelect.addEventListener('change', (e) => {
    renderGUI(e.target.value);
});

function renderGUI(type) {
    if (type === 'workflow') {
        helpText.innerHTML = "Save in: <code>.github/workflows/main.yml</code>";
        guiInterface.innerHTML = `
            <h2>Workflow Builder</h2>
            <label>Workflow Name:</label>
            <input type="text" id="wf-name" placeholder="CI Pipeline" oninput="updateWorkflow()">
            <div id="steps-container"><h3>Tasks</h3></div>
            <button onclick="addWorkflowStep()">+ Add New Task</button>
        `;
        addWorkflowStep();
    } else if (type === 'issue-form') {
        helpText.innerHTML = "Save in: <code>.github/ISSUE_TEMPLATE/report.yml</code>";
        guiInterface.innerHTML = `
            <h2>Issue Form Builder</h2>
            <input type="text" id="issue-name" placeholder="Bug Report" oninput="updateIssueForm()">
            <input type="text" id="issue-desc" placeholder="Describe the template purpose" oninput="updateIssueForm()">
            <div id="elements-container"><h3>Form Elements</h3></div>
            <div class="button-group">
                <button onclick="addFormElement('textarea')">+ Textarea</button>
                <button onclick="addFormElement('input')">+ Input</button>
                <button onclick="addFormElement('checkboxes')">+ Checkboxes</button>
            </div>
        `;
        updateIssueForm();
    }
}

// --- Workflow Logic ---
function addWorkflowStep() {
    const container = document.getElementById('steps-container');
    const div = document.createElement('div');
    div.className = 'step-item';
    div.innerHTML = `
        <input type="text" placeholder="Task Name" class="step-name" oninput="updateWorkflow()">
        <textarea placeholder="Shell Code (e.g. npm run build)" class="step-run" oninput="updateWorkflow()"></textarea>
        <button class="remove-btn" onclick="this.parentElement.remove(); updateWorkflow();">Delete</button>
    `;
    container.appendChild(div);
    updateWorkflow();
}

function updateWorkflow() {
    const name = document.getElementById('wf-name').value || 'Workflow';
    let yaml = [`name: ${name}`, `on: [push]`, `jobs:`, `  build:`, `    runs-on: ubuntu-latest`, `    steps:`];
    
    document.querySelectorAll('#steps-container .step-item').forEach(el => {
        const sName = el.querySelector('.step-name').value || 'Step';
        const sRun = el.querySelector('.step-run').value || 'echo "Hello"';
        yaml.push(`      - name: ${sName}`, `        run: |`, `          ${sRun.replace(/\n/g, '\n          ')}`);
    });
    yamlPreview.textContent = yaml.join('\n');
}

// --- Issue Form Logic ---
function addFormElement(type) {
    const container = document.getElementById('elements-container');
    const div = document.createElement('div');
    div.className = 'step-item';
    div.dataset.type = type;
    div.innerHTML = `
        <strong>${type.toUpperCase()}</strong>
        <input type="text" placeholder="ID (e.g. bug-desc)" class="el-id" oninput="updateIssueForm()">
        <input type="text" placeholder="Label" class="el-label" oninput="updateIssueForm()">
        ${type === 'checkboxes' ? '<textarea placeholder="Options (one per line)" class="el-opts" oninput="updateIssueForm()"></textarea>' : ''}
        <label><input type="checkbox" class="el-req" onchange="updateIssueForm()"> Required?</label>
        <button class="remove-btn" onclick="this.parentElement.remove(); updateIssueForm();">Delete</button>
    `;
    container.appendChild(div);
    updateIssueForm();
}

function updateIssueForm() {
    const name = document.getElementById('issue-name').value || 'Report';
    const desc = document.getElementById('issue-desc').value || 'Description';
    let yaml = [`name: ${name}`, `description: ${desc}`, `body:`];

    document.querySelectorAll('#elements-container .step-item').forEach(el => {
        const type = el.dataset.type;
        const id = el.querySelector('.el-id').value || 'field-id';
        const label = el.querySelector('.el-label').value || 'Label';
        const isReq = el.querySelector('.el-req').checked;

        yaml.push(`  - id: ${id}`, `    type: ${type}`, `    attributes:`, `      label: "${label}"`);
        if (type === 'checkboxes') {
            yaml.push(`      options:`);
            el.querySelector('.el-opts').value.split('\n').forEach(opt => {
                if(opt) yaml.push(`        - label: "${opt}"`, `          required: ${isReq}`);
            });
        } else {
            yaml.push(`    validations:`, `      required: ${isReq}`);
        }
    });
    yamlPreview.textContent = yaml.join('\n');
}

// --- Utils ---
document.getElementById('copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(yamlPreview.textContent);
    alert("Copied!");
});

document.getElementById('download-btn').addEventListener('click', () => {
    const blob = new Blob([yamlPreview.textContent], { type: 'text/yaml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = document.getElementById('yaml-type').value + ".yml";
    a.click();
});
