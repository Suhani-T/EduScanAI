function setupDropzone(dropzoneId, inputId,previewId) {
    const dropzone = document.getElementById(dropzoneId);
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    dropzone.addEventListener('click', () => input.click());

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        input.files = e.dataTransfer.files;
        showPreview(input, preview);
    });

    input.addEventListener('change', () => showPreview(input, preview));
}

function showPreview(input, preview) {
    const file = input.files[0];
    if (!file) {
        preview.innerHTML = '';
        return;
    }

    const icons = {
        pdf: '<i class="bi bi-file-earmark-pdf-fill text-danger"></i>',
        txt: '<i class="bi bi-file-earmark-text-fill text-primary"></i>',
        docx: '<i class="bi bi-file-earmark-word-fill text-info"></i>',
        jpg: '<i class="bi bi-file-earmark-image-fill text-warning"></i>',
        png: '<i class="bi bi-file-earmark-image-fill text-success"></i>'
    };

    const ext = file.name.split('.').pop().toLowerCase();
    const icon = icons[ext] || '<i class="bi bi-file-earmark-fill"></i>';

    preview.innerHTML = `${icon} ${file.name}`;
    
}

setupDropzone('answerKeyDrop', 'answerKey', 'answerKeyPreview');
setupDropzone('studentScriptDrop', 'studentScript', 'studentScriptPreview');
