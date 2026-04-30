const yamlTypeSelect = document.getElementById('yaml-type');
const guiInterface = document.getElementById('gui-interface');
const yamlPreview = document.getElementById('yaml-preview');
const helpText = document.getElementById('help-text');

yamlTypeSelect.addEventListener('change', (e) => renderGUI(e.target.value));

function renderGUI(type) {
    if (type === 'workflow') {
        helpText.innerText = ".github/workflows/main.yml";
        guiInterface.innerHTML = `
            <div class="card-header"><strong>Workflow Editor</strong></div>
            <div class="card-body">
                <label>Workflow Name</label>
                <input type="text" id="wf-name" class="gh-input" placeholder="CI" oninput="updateWorkflow()">
                <div id="steps-container"></div>
                <button class="gh-btn" style="width:100%" onclick="addWorkflowStep()">+ Add Step</button>
            </div>
        `;
        addWorkflowStep();
    } else if (type === 'issue-form') {
        helpText.innerText = ".github/ISSUE_TEMPLATE/report.yml";
        guiInterface.innerHTML = `
            <div class="card-header"><strong>Form Editor</strong></div>
            <div class="card-body">
                <input type="text" id="form-name" class="gh-input" placeholder="Form Name" oninput="updateIssueForm()">
                <input type="text" id="form-desc" class="gh-input" placeholder="Description" oninput="updateIssueForm()">
                <div id="elements-container"></div>
                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px;">
                    <button class="gh-btn" onclick="addFormElement('textarea')">Textarea</button>
                    <button class="gh-btn" onclick="addFormElement('input')">Input</button>
                    <button class="gh-btn" onclick="addFormElement('checkboxes')">Checks</button>
                </div>
            </div>
        `;
        updateIssueForm();
    }
}

// --- Workflow Functions ---
function addWorkflowStep() {
    const container = document.getElementById('steps-container');
    const div = document.createElement('div');
    div.className = 'step-item';
    div.innerHTML = `
        <div class="step-top"><strong>Step</strong><button class="gh-btn-danger" onclick="this.parentElement.parentElement.remove(); updateWorkflow();">Delete</button></div>
        <input type="text" class="gh-input step-name" placeholder="Name" oninput="updateWorkflow()">
        <textarea class="gh-input step-run" placeholder="Run command" oninput="updateWorkflow()"></textarea>
    `;
    container.appendChild(div);
    updateWorkflow();
}

function updateWorkflow() {
    const name = document.getElementById('wf-name').value || 'Workflow';
    let yaml = [`name: ${name}`, `on: [push]`, `jobs:`, `  build:`, `    runs-on: ubuntu-latest`, `    steps:`];
    document.querySelectorAll('.step-item').forEach(el => {
        const sName = el.querySelector('.step-name').value || 'Step';
        const sRun = el.querySelector('.step-run').value || 'echo "hello"';
        yaml.push(`      - name: ${sName}`, `        run: ${sRun}`);
    });
    yamlPreview.textContent = yaml.join('\n');
}

// --- Issue Form Functions ---
function addFormElement(type) {
    const container = document.getElementById('elements-container');
    const div = document.createElement('div');
    div.className = 'step-item';
    div.dataset.type = type;
    div.innerHTML = `
        <div class="step-top"><strong>${type.toUpperCase()}</strong><button class="gh-btn-danger" onclick="this.parentElement.parentElement.remove(); updateIssueForm();">Delete</button></div>
        <input type="text" class="gh-input el-id" placeholder="ID" oninput="updateIssueForm()">
        <input type="text" class="gh-input el-label" placeholder="Label" oninput="updateIssueForm()">
        ${type === 'checkboxes' ? '<textarea class="gh-input el-opts" placeholder="Options" oninput="updateIssueForm()"></textarea>' : ''}
    `;
    container.appendChild(div);
    updateIssueForm();
}

function updateIssueForm() {
    const name = document.getElementById('form-name').value || 'Report';
    const desc = document.getElementById('form-desc').value || 'Description';
    let yaml = [`name: ${name}`, `description: ${desc}`, `body:`];
    
    document.querySelectorAll('#elements-container .step-item').forEach(el => {
        const type = el.dataset.type;
        yaml.push(`  - type: ${type}`, `    id: ${el.querySelector('.el-id').value || 'id'}`, `    attributes:`, `      label: "${el.querySelector('.el-label').value || 'Label'}"`);
        if (type === 'checkboxes') {
            yaml.push(`      options:`);
            el.querySelector('.el-opts').value.split('\n').forEach(opt => opt && yaml.push(`        - label: "${opt}"`));
        }
    });
    yamlPreview.textContent = yaml.join('\n');
}

// Global actions
document.getElementById('copy-btn').onclick = () => {
    navigator.clipboard.writeText(yamlPreview.textContent);
    alert('Copied!');
};

document.getElementById('download-btn').onclick = () => {
    const blob = new Blob([yamlPreview.textContent], { type: 'text/yaml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "github-config.yml";
    a.click();
};
