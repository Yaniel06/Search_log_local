// Obtener elementos del HTML
const searchBtn = document.getElementById('searchBtn');
const searchTerms = document.getElementById('searchTerms');
const results = document.getElementById('results');
const resultsContent = document.getElementById('resultsContent');
const exportExcelBtn = document.getElementById('exportExcelBtn');
const resultsCount = document.getElementById('resultsCount');

// Elementos de selección
const selectFolderBtn = document.getElementById('selectFolderBtn');
const selectFilesBtn = document.getElementById('selectFilesBtn');
const folderInput = document.getElementById('folderInput');
const filesInput = document.getElementById('filesInput');
const selectionPath = document.getElementById('selectionPath');
const selectionCount = document.getElementById('selectionCount');

// Variable para guardar los archivos seleccionados
let selectedFiles = [];
let selectionType = 'folder';
let ultimosResultados = [];

// Extensiones de metadata de Salesforce
const SF_EXTENSIONS = [
    '.cls', '.trigger', '.page', '.component',
    '.cmp', '.evt', '.app',
    '.flow', '.flow-meta.xml',
    '.object', '.object-meta.xml', '.field-meta.xml',
    '.layout', '.layout-meta.xml',
    '.profile', '.profile-meta.xml',
    '.permissionset', '.permissionset-meta.xml',
    '.validationRule-meta.xml',
    '.workflow', '.workflow-meta.xml',
    '.report', '.report-meta.xml',
    '.dashboard', '.labels', '.labels-meta.xml',
    '.resource-meta.xml', '.tab-meta.xml',
    '.flexipage-meta.xml', '.remoteSite-meta.xml',
    '.quickAction-meta.xml', '.approvalProcess-meta.xml',
    '.assignmentRules-meta.xml', '.sharingRules-meta.xml',
    '.globalValueSet-meta.xml', '.standardValueSet-meta.xml',
];

// Carpetas conocidas de Salesforce
const SF_FOLDERS = [
    '/classes/', '/triggers/', '/pages/', '/components/',
    '/lwc/', '/aura/', '/flows/', '/objects/',
    '/layouts/', '/profiles/', '/permissionsets/',
    '/workflows/', '/reports/', '/dashboards/',
    '/labels/', '/staticresources/', '/tabs/',
    '/flexipages/', '/quickActions/',
];

// Verificar si un archivo es metadata de Salesforce
function esSalesforce(filePath) {
    const lower = filePath.toLowerCase().replace(/\\/g, '/');

    for (const folder of SF_FOLDERS) {
        if (lower.includes(folder)) return true;
    }

    for (const ext of SF_EXTENSIONS) {
        if (lower.endsWith(ext)) return true;
    }

    return false;
}

// Determinar el tipo de metadata por extensión
function getTipoMetadata(filePath) {
    const lower = filePath.toLowerCase();
    if (lower.endsWith('.cls')) return 'Apex Class';
    if (lower.endsWith('.trigger')) return 'Apex Trigger';
    if (lower.endsWith('.page')) return 'VF Page';
    if (lower.endsWith('.component')) return 'VF Component';
    if (lower.endsWith('.cmp')) return 'Aura Component';
    if (lower.endsWith('.evt')) return 'Aura Event';
    if (lower.endsWith('.app')) return 'Aura App';
    if (lower.includes('.flow')) return 'Flow';
    if (lower.includes('.object')) return 'Object';
    if (lower.includes('.field-meta')) return 'Field';
    if (lower.includes('.layout')) return 'Layout';
    if (lower.includes('.profile')) return 'Profile';
    if (lower.includes('.permissionset')) return 'Permission Set';
    if (lower.includes('.validationRule')) return 'Validation Rule';
    if (lower.includes('.workflow')) return 'Workflow';
    if (lower.includes('.report')) return 'Report';
    if (lower.includes('.dashboard')) return 'Dashboard';
    if (lower.includes('/lwc/')) return 'LWC';
    if (lower.includes('/aura/')) return 'Aura';
    return 'Metadata';
}

// Cuando se hace clic en "Select Folder"
selectFolderBtn.addEventListener('click', function() {
    selectionType = 'folder';
    updateActiveButton();
    folderInput.value = '';
    folderInput.click();
});

// Cuando se hace clic en "Select Files"
selectFilesBtn.addEventListener('click', function() {
    selectionType = 'files';
    updateActiveButton();
    filesInput.value = '';
    filesInput.click();
});

// Actualizar botón activo
function updateActiveButton() {
    if (selectionType === 'folder') {
        selectFolderBtn.classList.add('active');
        selectFilesBtn.classList.remove('active');
    } else {
        selectFilesBtn.classList.add('active');
        selectFolderBtn.classList.remove('active');
    }
}

// Cuando se selecciona una carpeta
folderInput.addEventListener('change', function(e) {
    selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length > 0) {
        const firstFilePath = selectedFiles[0].webkitRelativePath;
        const folderName = firstFilePath.split('/')[0];
        const sfCount = selectedFiles.filter(f => esSalesforce(f.webkitRelativePath || f.name)).length;

        selectionPath.value = `📁 ${folderName}`;
        selectionCount.textContent = `${sfCount} metadata / ${selectedFiles.length} total`;
        selectionCount.classList.add('has-files');
    }
});

// Cuando se seleccionan archivos individuales
filesInput.addEventListener('change', function(e) {
    selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length > 0) {
        const sfCount = selectedFiles.filter(f => esSalesforce(f.webkitRelativePath || f.name)).length;

        if (selectedFiles.length === 1) {
            selectionPath.value = `📄 ${selectedFiles[0].name}`;
        } else {
            selectionPath.value = `📄 ${selectedFiles.length} selected files`;
        }
        selectionCount.textContent = `${sfCount} metadata / ${selectedFiles.length} total`;
        selectionCount.classList.add('has-files');
    }
});

// Cuando se hace clic en el botón de búsqueda
searchBtn.addEventListener('click', async function() {
    if (selectedFiles.length === 0) {
        alert('Please select a folder or files first');
        return;
    }

    const terms = searchTerms.value.trim();
    if (!terms) {
        alert('Please enter at least one search term');
        return;
    }

    const termsList = terms.split('\n')
        .map(t => t.trim())
        .filter(t => t !== '');

    // Deshabilitar botón mientras busca
    const btnText = searchBtn.querySelector('.btn-action-text');
    const btnLoader = searchBtn.querySelector('.btn-action-loader');
    const btnArrow = searchBtn.querySelector('.btn-action-arrow');
    if (btnText) btnText.style.display = 'none';
    if (btnArrow) btnArrow.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline-flex';
    searchBtn.disabled = true;

    // Buscar
    ultimosResultados = await buscarEnArchivos(termsList);

    // Mostrar resultados
    mostrarResultados(ultimosResultados);

    // Restaurar botón
    if (btnText) btnText.style.display = '';
    if (btnArrow) btnArrow.style.display = '';
    if (btnLoader) btnLoader.style.display = 'none';
    searchBtn.disabled = false;
});

// Función para buscar en los archivos (solo Salesforce)
async function buscarEnArchivos(termsList) {
    const resultados = [];

    for (const file of selectedFiles) {
        const filePath = file.webkitRelativePath || file.name;

        // Solo archivos de Salesforce
        if (!esSalesforce(filePath)) continue;

        try {
            const contenido = await leerArchivo(file);
            const lineas = contenido.split('\n');

            lineas.forEach((linea, index) => {
                termsList.forEach(termino => {
                    if (linea.toLowerCase().includes(termino.toLowerCase())) {
                        resultados.push({
                            termino: termino,
                            archivo: filePath,
                            nombreArchivo: filePath.split('/').pop(),
                            tipoMetadata: getTipoMetadata(filePath),
                            lineaNumero: index + 1,
                            contenido: linea.trim()
                        });
                    }
                });
            });
        } catch (error) {
            console.log('Could not read:', file.name);
        }
    }

    return resultados;
}

// Función para leer un archivo
function leerArchivo(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) { resolve(e.target.result); };
        reader.onerror = function() { reject(new Error('Error reading file')); };
        reader.readAsText(file);
    });
}

// Función para mostrar los resultados
function mostrarResultados(resultados) {
    resultsContent.innerHTML = '';
    results.style.display = 'block';

    if (resultsCount) resultsCount.textContent = resultados.length;

    if (resultados.length === 0) {
        resultsContent.innerHTML = '<div class="no-results"><p>No references found in Salesforce metadata files.</p></div>';
        if (exportExcelBtn) exportExcelBtn.style.display = 'none';
        return;
    }

    if (exportExcelBtn) exportExcelBtn.style.display = '';

    // Agrupar por término
    const agrupadoPorTermino = {};
    resultados.forEach(r => {
        if (!agrupadoPorTermino[r.termino]) {
            agrupadoPorTermino[r.termino] = [];
        }
        agrupadoPorTermino[r.termino].push(r);
    });

    // Mostrar resultados agrupados
    Object.keys(agrupadoPorTermino).forEach(termino => {
        const grupo = agrupadoPorTermino[termino];

        const groupDiv = document.createElement('div');
        groupDiv.className = 'result-group';

        const header = document.createElement('div');
        header.className = 'result-group-header';
        header.innerHTML = `
            <span class="result-group-term">${escapeHtml(termino)}</span>
            <span class="result-group-count">${grupo.length} match${grupo.length !== 1 ? 'es' : ''}</span>`;

        const body = document.createElement('div');
        body.className = 'result-group-body';

        grupo.forEach(resultado => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `
                <span class="result-type-badge">${escapeHtml(resultado.tipoMetadata)}</span>
                <div class="result-item-info">
                    <span class="result-item-name">${escapeHtml(resultado.nombreArchivo)}</span>
                    <span class="result-item-path">${escapeHtml(resultado.archivo)}</span>
                    <span class="result-item-line">Line ${resultado.lineaNumero}: <code>${escapeHtml(resultado.contenido)}</code></span>
                </div>`;
            body.appendChild(div);
        });

        // Toggle collapse
        let collapsed = false;
        header.addEventListener('click', () => {
            collapsed = !collapsed;
            body.style.display = collapsed ? 'none' : '';
        });

        groupDiv.appendChild(header);
        groupDiv.appendChild(body);
        resultsContent.appendChild(groupDiv);
    });

    results.scrollIntoView({ behavior: 'smooth' });
}

// Export a Excel
if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', function() {
        if (ultimosResultados.length === 0) return;

        const wsData = [
            ['Reference Name', 'Metadata Name', 'Metadata Type', 'File Path', 'Line', 'Content']
        ];

        ultimosResultados.forEach(r => {
            wsData.push([
                r.termino,
                r.nombreArchivo,
                r.tipoMetadata,
                r.archivo,
                r.lineaNumero,
                r.contenido
            ]);
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        ws['!cols'] = [
            { wch: 30 },  // Reference Name
            { wch: 35 },  // Metadata Name
            { wch: 20 },  // Metadata Type
            { wch: 60 },  // File Path
            { wch: 8 },   // Line
            { wch: 80 },  // Content
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Search Results');

        const ts = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `MetaFinder_Results_${ts}.xlsx`);
    });
}

// Función para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}