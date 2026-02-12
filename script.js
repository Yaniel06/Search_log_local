
const searchBtn = document.getElementById('searchBtn');
const searchTerms = document.getElementById('searchTerms');
const results = document.getElementById('results');
const resultsContent = document.getElementById('resultsContent');
const exportExcelBtn = document.getElementById('exportExcelBtn');
const resultsCount = document.getElementById('resultsCount');


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


const BINARY_EXTENSIONS = [
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg',
    '.zip', '.rar', '.7z', '.tar', '.gz',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.exe', '.dll', '.so', '.dylib',
    '.mp3', '.mp4', '.wav', '.avi', '.mov', '.mkv',
    '.woff', '.woff2', '.ttf', '.eot',
    '.class', '.jar', '.pyc',
];


const IGNORED_FOLDERS = [
    '/.git/', '/node_modules/', '/.sfdx/', '/.sf/',
    '/dist/', '/build/', '/__pycache__/',
    '/.vscode/', '/.idea/',
];


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


function getTipoArchivo(filePath) {
    const lower = filePath.toLowerCase();

    // ── Salesforce Metadata (antes de .xml genérico) ──
    // Apex
    if (lower.endsWith('.cls-meta.xml'))             return 'Apex Class Meta';
    if (lower.endsWith('.trigger-meta.xml'))          return 'Apex Trigger Meta';

    // Visualforce
    if (lower.endsWith('.page-meta.xml'))             return 'VF Page Meta';
    if (lower.endsWith('.component-meta.xml'))         return 'VF Component Meta';

    // LWC / Aura
    if (lower.endsWith('.cmp-meta.xml'))              return 'Aura Component Meta';
    if (lower.endsWith('.app-meta.xml'))              return 'Aura App Meta';
    if (lower.endsWith('.evt-meta.xml'))              return 'Aura Event Meta';
    if (lower.endsWith('.intf-meta.xml'))             return 'Aura Interface Meta';
    if (lower.endsWith('.tokens-meta.xml'))           return 'Aura Tokens Meta';
    if (lower.endsWith('.js-meta.xml'))               return 'LWC Meta';

    // Objects & Fields
    if (lower.endsWith('.object-meta.xml'))           return 'Custom Object Meta';
    if (lower.endsWith('.field-meta.xml'))            return 'Custom Field Meta';
    if (lower.endsWith('.listview-meta.xml'))         return 'List View Meta';
    if (lower.endsWith('.recordtype-meta.xml'))       return 'Record Type Meta';
    if (lower.endsWith('.compactlayout-meta.xml'))    return 'Compact Layout Meta';
    if (lower.endsWith('.fieldset-meta.xml'))         return 'Field Set Meta';
    if (lower.endsWith('.index-meta.xml'))            return 'Custom Index Meta';
    if (lower.endsWith('.businessprocess-meta.xml'))  return 'Business Process Meta';
    if (lower.endsWith('.weblink-meta.xml'))          return 'Web Link Meta';
    if (lower.endsWith('.validationrule-meta.xml'))   return 'Validation Rule Meta';
    if (lower.endsWith('.sharingreason-meta.xml'))    return 'Sharing Reason Meta';

    // Layouts & FlexiPages
    if (lower.endsWith('.layout-meta.xml'))           return 'Page Layout Meta';
    if (lower.endsWith('.flexipage-meta.xml'))        return 'FlexiPage Meta';

    // Tabs
    if (lower.endsWith('.tab-meta.xml'))              return 'Custom Tab Meta';

    // Flows & Processes
    if (lower.endsWith('.flow-meta.xml'))             return 'Flow Meta';

    // Approval Processes
    if (lower.endsWith('.approvalprocess-meta.xml'))  return 'Approval Process Meta';

    // Workflows
    if (lower.endsWith('.workflow-meta.xml'))         return 'Workflow Meta';
    if (lower.endsWith('.workflowrule-meta.xml'))     return 'Workflow Rule Meta';
    if (lower.endsWith('.workflowfieldupdate-meta.xml'))  return 'Workflow Field Update Meta';
    if (lower.endsWith('.workflowalert-meta.xml'))    return 'Workflow Alert Meta';
    if (lower.endsWith('.workflowoutboundmessage-meta.xml')) return 'Workflow Outbound Msg Meta';
    if (lower.endsWith('.workflowtask-meta.xml'))     return 'Workflow Task Meta';

    // Assignment & Auto-Response Rules
    if (lower.endsWith('.assignmentrules-meta.xml'))  return 'Assignment Rules Meta';
    if (lower.endsWith('.autoresponserules-meta.xml')) return 'Auto-Response Rules Meta';
    if (lower.endsWith('.escalationrules-meta.xml'))  return 'Escalation Rules Meta';
    if (lower.endsWith('.matchingrules-meta.xml'))    return 'Matching Rules Meta';
    if (lower.endsWith('.matchingrule-meta.xml'))     return 'Matching Rule Meta';
    if (lower.endsWith('.duplicaterule-meta.xml'))    return 'Duplicate Rule Meta';

    // Reports & Dashboards
    if (lower.endsWith('.report-meta.xml'))           return 'Report Meta';
    if (lower.endsWith('.dashboard-meta.xml'))        return 'Dashboard Meta';
    if (lower.endsWith('.reporttype-meta.xml'))       return 'Report Type Meta';
    if (lower.endsWith('.reportfolder-meta.xml'))     return 'Report Folder Meta';
    if (lower.endsWith('.dashboardfolder-meta.xml'))  return 'Dashboard Folder Meta';

    // Email
    if (lower.endsWith('.email-meta.xml'))            return 'Email Template Meta';
    if (lower.endsWith('.emailtemplate-meta.xml'))     return 'Email Template Meta';
    if (lower.endsWith('.emailfolder-meta.xml'))       return 'Email Folder Meta';
    if (lower.endsWith('.letterhead-meta.xml'))        return 'Letterhead Meta';

    // Permissions & Profiles
    if (lower.endsWith('.profile-meta.xml'))          return 'Profile Meta';
    if (lower.endsWith('.permissionset-meta.xml'))    return 'Permission Set Meta';
    if (lower.endsWith('.permissionsetgroup-meta.xml')) return 'Permission Set Group Meta';
    if (lower.endsWith('.role-meta.xml'))             return 'Role Meta';
    if (lower.endsWith('.group-meta.xml'))            return 'Public Group Meta';

    // Sharing Rules
    if (lower.endsWith('.sharingrules-meta.xml'))     return 'Sharing Rules Meta';
    if (lower.endsWith('.sharingownerrule-meta.xml')) return 'Sharing Owner Rule Meta';
    if (lower.endsWith('.sharingcriteriabasedrule-meta.xml')) return 'Sharing Criteria Rule Meta';
    if (lower.endsWith('.sharingguestrule-meta.xml')) return 'Sharing Guest Rule Meta';

    // Custom Labels & Translations
    if (lower.endsWith('.labels-meta.xml'))           return 'Custom Labels Meta';
    if (lower.endsWith('.customlabel-meta.xml'))      return 'Custom Label Meta';
    if (lower.endsWith('.translation-meta.xml'))      return 'Translation Meta';
    if (lower.endsWith('.objecttranslation-meta.xml')) return 'Object Translation Meta';
    if (lower.endsWith('.globalvalueset-meta.xml'))   return 'Global Value Set Meta';
    if (lower.endsWith('.globalvaluesettranslation-meta.xml')) return 'Global Value Set Translation Meta';
    if (lower.endsWith('.standardvalueset-meta.xml')) return 'Standard Value Set Meta';

    // Static Resources, Documents & Content
    if (lower.endsWith('.resource-meta.xml'))         return 'Static Resource Meta';
    if (lower.endsWith('.staticresource-meta.xml'))   return 'Static Resource Meta';
    if (lower.endsWith('.document-meta.xml'))         return 'Document Meta';
    if (lower.endsWith('.documentfolder-meta.xml'))   return 'Document Folder Meta';
    if (lower.endsWith('.contentasset-meta.xml'))     return 'Content Asset Meta';

    // Sites & Communities
    if (lower.endsWith('.site-meta.xml'))             return 'Site Meta';
    if (lower.endsWith('.sitedotcom-meta.xml'))       return 'Site.com Meta';
    if (lower.endsWith('.network-meta.xml'))          return 'Community Meta';
    if (lower.endsWith('.experiencebundle-meta.xml')) return 'Experience Bundle Meta';
    if (lower.endsWith('.navigationmenu-meta.xml'))   return 'Navigation Menu Meta';

    // Connected Apps & Auth
    if (lower.endsWith('.connectedapp-meta.xml'))     return 'Connected App Meta';
    if (lower.endsWith('.authprovider-meta.xml'))     return 'Auth Provider Meta';
    if (lower.endsWith('.namedcredential-meta.xml'))  return 'Named Credential Meta';
    if (lower.endsWith('.externalcredential-meta.xml')) return 'External Credential Meta';
    if (lower.endsWith('.externaldatasource-meta.xml')) return 'External Data Source Meta';

    // Custom Settings & Metadata Types
    if (lower.endsWith('.custommetadata-meta.xml'))   return 'Custom Metadata Meta';
    if (lower.endsWith('.md-meta.xml'))               return 'Custom Metadata Record Meta';
    if (lower.endsWith('.globalvalueset-meta.xml'))   return 'Global Value Set Meta';

    // Remote Site Settings
    if (lower.endsWith('.remotesitesetting-meta.xml')) return 'Remote Site Setting Meta';
    if (lower.endsWith('.cspsiteuri-meta.xml'))        return 'CSP Trusted Site Meta';
    if (lower.endsWith('.corswhitelistorigin-meta.xml')) return 'CORS Whitelist Meta';

    // Quick Actions
    if (lower.endsWith('.quickaction-meta.xml'))      return 'Quick Action Meta';

    // Path & Picklist
    if (lower.endsWith('.pathassistant-meta.xml'))    return 'Path Meta';

    // Lightning Bolt & Templates
    if (lower.endsWith('.lightningbolt-meta.xml'))    return 'Lightning Bolt Meta';
    if (lower.endsWith('.lightningexperiencetheme-meta.xml')) return 'Lightning Theme Meta';
    if (lower.endsWith('.lightningmessagechannel-meta.xml')) return 'Message Channel Meta';

    // Platform Events & Streaming
    if (lower.endsWith('.platformeventchannel-meta.xml'))    return 'Platform Event Channel Meta';
    if (lower.endsWith('.platformeventchannelmember-meta.xml')) return 'Platform Event Member Meta';

    // Custom Notifications
    if (lower.endsWith('.customnotificationtype-meta.xml'))   return 'Custom Notification Meta';

    // Settings
    if (lower.endsWith('.settings-meta.xml'))         return 'Settings Meta';

    // Home Page
    if (lower.endsWith('.homepagelayout-meta.xml'))   return 'Home Page Layout Meta';
    if (lower.endsWith('.homepagecomponent-meta.xml')) return 'Home Page Component Meta';

    // Data Categories
    if (lower.endsWith('.datacategorygroup-meta.xml')) return 'Data Category Group Meta';

    // Entitlement
    if (lower.endsWith('.entitlementprocess-meta.xml')) return 'Entitlement Process Meta';
    if (lower.endsWith('.milestoneType-meta.xml'))      return 'Milestone Type Meta';

    // Territory
    if (lower.endsWith('.territory2model-meta.xml'))  return 'Territory Model Meta';
    if (lower.endsWith('.territory2type-meta.xml'))   return 'Territory Type Meta';
    if (lower.endsWith('.territory2rule-meta.xml'))   return 'Territory Rule Meta';

    // Einstein / AI
    if (lower.endsWith('.bot-meta.xml'))              return 'Einstein Bot Meta';
    if (lower.endsWith('.botversion-meta.xml'))       return 'Einstein Bot Version Meta';
    if (lower.endsWith('.mlprediction-meta.xml'))     return 'ML Prediction Meta';

    // Omnichannel
    if (lower.endsWith('.queueroutingconfig-meta.xml'))  return 'Queue Routing Config Meta';
    if (lower.endsWith('.serviceChannel-meta.xml'))      return 'Service Channel Meta';
    if (lower.endsWith('.presenceDeclineReason-meta.xml')) return 'Presence Decline Reason Meta';
    if (lower.endsWith('.presenceUserConfig-meta.xml'))   return 'Presence User Config Meta';

    // Misc
    if (lower.endsWith('.queue-meta.xml'))            return 'Queue Meta';
    if (lower.endsWith('.recordactiondeployment-meta.xml')) return 'Record Action Meta';
    if (lower.endsWith('.cleanrule-meta.xml'))        return 'Clean Rule Meta';
    if (lower.endsWith('.testSuite-meta.xml'))        return 'Test Suite Meta';
    if (lower.endsWith('.apexTestSuite-meta.xml'))    return 'Apex Test Suite Meta';

    // ── Catch-all para cualquier -meta.xml no listado ──
    if (lower.endsWith('-meta.xml'))                  return 'SF Metadata';

    // ── Archivos fuente (no metadata) ──
    if (lower.endsWith('.cls'))       return 'Apex Class';
    if (lower.endsWith('.trigger'))   return 'Apex Trigger';
    if (lower.endsWith('.page'))      return 'VF Page';
    if (lower.endsWith('.component')) return 'VF Component';
    if (lower.endsWith('.cmp'))       return 'Aura Component';
    if (lower.endsWith('.js'))        return 'JavaScript';
    if (lower.endsWith('.ts'))        return 'TypeScript';
    if (lower.endsWith('.jsx'))       return 'JSX';
    if (lower.endsWith('.tsx'))       return 'TSX';
    if (lower.endsWith('.html'))      return 'HTML';
    if (lower.endsWith('.css'))       return 'CSS';
    if (lower.endsWith('.xml'))       return 'XML';
    if (lower.endsWith('.json'))      return 'JSON';
    if (lower.endsWith('.yaml') || lower.endsWith('.yml')) return 'YAML';
    if (lower.endsWith('.py'))        return 'Python';
    if (lower.endsWith('.java'))      return 'Java';
    if (lower.endsWith('.cs'))        return 'C#';
    if (lower.endsWith('.cpp') || lower.endsWith('.c') || lower.endsWith('.h')) return 'C/C++';
    if (lower.endsWith('.rb'))        return 'Ruby';
    if (lower.endsWith('.php'))       return 'PHP';
    if (lower.endsWith('.sql'))       return 'SQL';
    if (lower.endsWith('.sh') || lower.endsWith('.bash')) return 'Shell';
    if (lower.endsWith('.md'))        return 'Markdown';
    if (lower.endsWith('.txt'))       return 'Text';
    if (lower.endsWith('.csv'))       return 'CSV';
    if (lower.endsWith('.log'))       return 'Log';
    if (lower.endsWith('.properties')) return 'Properties';
    if (lower.endsWith('.cfg') || lower.endsWith('.conf') || lower.endsWith('.ini')) return 'Config';

    const ext = filePath.split('.').pop();
    return ext ? ext.toUpperCase() : 'File';
}


selectFolderBtn.addEventListener('click', function() {
    selectionType = 'folder';
    updateActiveButton();
    folderInput.value = '';
    folderInput.click();
});


selectFilesBtn.addEventListener('click', function() {
    selectionType = 'files';
    updateActiveButton();
    filesInput.value = '';
    filesInput.click();
});

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
                '.' + r.nombreArchivo.split('.').slice(1).join('.'),
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