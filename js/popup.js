let fileInput = document.getElementById("file-input");
let fileList = document.getElementById("files-list");
let numOfFiles = document.getElementById("num-of-files");
let saveButton = document.getElementById("save-button");
let loading = document.getElementById("loading");
let saveButtonDiv = document.getElementById("save-button-div");
let errormsg = document.getElementById("id-errormsg");
let errormsg2 = document.getElementById("id-errormsg2");
let infomsg = document.getElementById("info-msg");

saveButton.style.visibility = 'hidden';
loading.style.visibility = 'hidden';

function verificarPDF(file) {
  var extension = file.name.split('.').pop().toLowerCase();
  if (extension === 'pdf') {
    return true;
  } else {
    return false;
  }
}

fileInput.addEventListener('change', async function () {
    let files = this.files;
    errormsg.textContent = "";
    errormsg2.textContent = "";
    numOfFiles.textContent = `${files.length} Archivos seleccionados`;

    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = async function (event) {
            let listItem = document.createElement("li");
            let fileName = files[i].name;
            let fileSize = (files[i].size / 1024).toFixed(1);
            listItem.innerHTML = `<p>${fileName}</p><p>${fileSize}KB</p>`;
            if (fileSize >= 1024) {
            fileSize = (fileSize / 1024).toFixed(1);
            listItem.innerHTML = `<p>${fileName}</p><p>${fileSize}MB</p>`;
            }
            fileList.appendChild(listItem);
        };
        reader.readAsArrayBuffer(files[i]);
    }
    saveButton.style.visibility = 'visible';
    saveButton.addEventListener('click', async function () {
        await removeAds(files);
    });
});

async function removeAds(files) {

  loading.style.visibility = 'visible';

  window.cleaned = []

  const processFile = async (file) => {
    if (!verificarPDF(file)) {
      errormsg.textContent = 'Alguno de los archivos seleccionados no tiene extensión .pdf';
      return;
    }
    const reader = new FileReader();
    const fileLoaded = new Promise((resolve) => {
      reader.onload = resolve;
    });
    reader.readAsArrayBuffer(file);
    await fileLoaded;
    infomsg.textContent = "Procesando " + file.name + " ...";

    data = new Uint8Array(reader.result)

    //We decrypt the pdf 
    decrypted_pdf = await window.decrypt_pdf(data);
    if (decrypt_pdf == null) {
      errormsg2.textContent = 'Vaya, ha ocurrido un error.';
      return;
    }

    //We clean the pdf 
    cleaned_pdf = await window.clean_pdf(decrypted_pdf);
    if (cleaned_pdf == null) {
      errormsg2.textContent = 'Vaya, ha ocurrido un error.';
      return;
    }

    //We add the cleaned pdf to the array
    window.cleaned.push([cleaned_pdf, file.name])

  };
  const filesArray = Array.from(files);
  for (const file of filesArray) {
    await processFile(file);
  }

  loading.style.visibility = 'hidden';
  infomsg.textContent = ""

  downloadFile();
}

//Function that downloads all of the files in the window.cleaned array, either as a zip or as a single file.
async function downloadFile() {
  if (window.cleaned.length == 1) {
      bytes = window.cleaned[0][0]
      var blob = new Blob([bytes], {
          type: "application/pdf"
      });
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = window.cleaned[0][1].slice(0, -4) + "-gulag-free.pdf";
      link.click();
  } else if (window.cleaned.length > 1) {
      var zip = new JSZip();
      for (i in window.cleaned) {
          bytes = window.cleaned[i][0]
          zip.file(window.cleaned[i][1].slice(0, -4) + "-gulag-free.pdf", bytes);
      }
      zip.generateAsync({
          type: "blob"
      })
      .then(function(content) {
          var link = document.createElement('a');
          link.href = window.URL.createObjectURL(content);
          link.download = "PDFs-gulag-free.zip";
          link.click();
      });
  }
}