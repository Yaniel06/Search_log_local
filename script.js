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

// Extensiones binarias que NO se deben leer (no son texto)
const BINARY_EXTENSIONS = [
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg',
    '.zip', '.rar', '.7z', '.tar', '.gz',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.exe', '.dll', '.so', '.dylib',
    '.mp3', '.mp4', '.wav', '.avi', '.mov', '.mkv',
    '.woff', '.woff2', '.ttf', '.eot',
    '.class', '.jar', '.pyc',
];

// Carpetas que se deben ignorar
const IGNORED_FOLDERS = [
    '/.git/', '/node_modules/', '/.sfdx/', '/.sf/',
    '/dist/', '/build/', '/__pycache__/',
    '/.vscode/', '/.idea/',
];

// Verificar si un archivo se debe ignorar
function debeIgnorar(filePath) {
    const lower = filePath.toLowerCase().replace(/\\/g, '/');

    for (const folder of IGNORED_FOLDERS) {
        if (lower.includes(folder)) return true;
    }
    if (lower.startsWith('.git/')) return true;

    for (const ext of BINARY_EXTENSIONS) {
        if (lower.endsWith(ext)) return true;
    }

    return false;
}

// Obtener tipo de archivo por extensión
function getTipoArchivo(filePath) {
    const lower = filePath.toLowerCase();
    if (lower.endsWith('.cls')) return 'Apex Class';
    if (lower.endsWith('.trigger')) return 'Apex Trigger';
    if (lower.endsWith('.page')) return 'VF Page';
    if (lower.endsWith('.component')) return 'VF Component';
    if (lower.endsWith('.cmp')) return 'Aura Component';
    if (lower.endsWith('.js')) return 'JavaScript';
    if (lower.endsWith('.ts')) return 'TypeScript';
    if (lower.endsWith('.jsx')) return 'JSX';
    if (lower.endsWith('.tsx')) return 'TSX';
    if (lower.endsWith('.html')) return 'HTML';
    if (lower.endsWith('.css')) return 'CSS';
    if (lower.endsWith('.xml')) return 'XML';
    if (lower.endsWith('.json')) return 'JSON';
    if (lower.endsWith('.yaml') || lower.endsWith('.yml')) return 'YAML';
    if (lower.endsWith('.py')) return 'Python';
    if (lower.endsWith('.java')) return 'Java';
    if (lower.endsWith('.cs')) return 'C#';
    if (lower.endsWith('.cpp') || lower.endsWith('.c') || lower.endsWith('.h')) return 'C/C++';
    if (lower.endsWith('.rb')) return 'Ruby';
    if (lower.endsWith('.php')) return 'PHP';
    if (lower.endsWith('.sql')) return 'SQL';
    if (lower.endsWith('.sh') || lower.endsWith('.bash')) return 'Shell';
    if (lower.endsWith('.md')) return 'Markdown';
    if (lower.endsWith('.txt')) return 'Text';
    if (lower.endsWith('.csv')) return 'CSV';
    if (lower.endsWith('.log')) return 'Log';
    if (lower.endsWith('.properties')) return 'Properties';
    if (lower.endsWith('.cfg') || lower.endsWith('.conf') || lower.endsWith('.ini')) return 'Config';

    const ext = filePath.split('.').pop();
    return ext ? ext.toUpperCase() : 'File';
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
        const searchable = selectedFiles.filter(f => !debeIgnorar(f.webkitRelativePath || f.name)).length;

        selectionPath.value = `📁 ${folderName}`;
        selectionCount.textContent = `${searchable} searchable / ${selectedFiles.length} total`;
        selectionCount.classList.add('has-files');
    }
});

// Cuando se seleccionan archivos individuales
filesInput.addEventListener('change', function(e) {
    selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length > 0) {
        const searchable = selectedFiles.filter(f => !debeIgnorar(f.webkitRelativePath || f.name)).length;

        if (selectedFiles.length === 1) {
            selectionPath.value = `📄 ${selectedFiles[0].name}`;
        } else {
            selectionPath.value = `📄 ${selectedFiles.length} selected files`;
        }
        selectionCount.textContent = `${searchable} searchable / ${selectedFiles.length} total`;
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

// Función para buscar en los archivos (TODOS los archivos de texto)
async function buscarEnArchivos(termsList) {
    const resultados = [];

    for (const file of selectedFiles) {
        const filePath = file.webkitRelativePath || file.name;

        // Solo ignorar binarios y carpetas de sistema
        if (debeIgnorar(filePath)) continue;

        try {
            const contenido = await leerArchivo(file);
            const lineas = contenido.split('\n');

            lineas.forEach((linea, index) => {
                termsList.forEach(termino => {

                    // Escapar caracteres especiales del término
                    const terminoEscapado = termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                    // Crear regex global e insensible a mayúsculas
                    const regex = new RegExp(terminoEscapado, 'gi');

                    let match;

                    while ((match = regex.exec(linea)) !== null) {
                        resultados.push({
                            termino: termino,
                            archivo: filePath,
                            nombreArchivo: filePath.split('/').pop(),
                            tipoMetadata: getTipoArchivo(filePath),
                            lineaNumero: index + 1,
                            columna: match.index + 1,
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
        resultsContent.innerHTML = '<div class="no-results"><p>No references found.</p></div>';
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
                    <span class="result-item-line">Line ${resultado.lineaNumero}, Col ${resultado.columna}: <code>${escapeHtml(resultado.contenido)}</code></span>
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
            ['Reference Name', 'File Name', 'File Type', 'File Path', 'Line', 'Column', 'Content']
        ];

        ultimosResultados.forEach(r => {
            wsData.push([
                r.termino,
                r.nombreArchivo,
                r.tipoMetadata,
                r.archivo,
                r.lineaNumero,
                r.columna,
                r.contenido
            ]);
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        ws['!cols'] = [
            { wch: 30 },
            { wch: 35 },
            { wch: 20 },
            { wch: 60 },
            { wch: 8 },
            { wch: 8 },
            { wch: 80 },
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Search Results');

        const ts = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `SearchResults_${ts}.xlsx`);
    });
}

// Función para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}