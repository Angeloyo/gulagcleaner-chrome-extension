let fileInput = document.getElementById("file-input");
let fileList = document.getElementById("files-list");
let numOfFiles = document.getElementById("num-of-files");
let saveButton = document.getElementById("save-button");
let loading = document.getElementById("loading");
let saveButtonDiv = document.getElementById("save-button-div");
let errormsg = document.getElementById("id-errormsg");
let errormsg2 = document.getElementById("id-errormsg2");
let errormsg3 = document.getElementById("id-errormsg3");
// let divzip = document.getElementById("div_zip");
let cbx = document.getElementById("cbx");
let msg = document.getElementById("id-msg");
let infomsg = document.getElementById("info-msg");
let pacienciamsg = document.getElementById("paciencia-msg");

saveButton.style.visibility = 'hidden';
loading.style.visibility = 'hidden';
pacienciamsg.style.visibility = 'hidden';

let numFiles = 0;
const zip = new JSZip();

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
    numFiles += files.length;
    numOfFiles.textContent = `${numFiles} Archivos seleccionados`;
    // if (numFiles > 1){
    //   divzip.style.visibility = 'visible'
    // }
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
  // let checked = false;
  // if (numFiles > 1) {
  //   checked = cbx.checked;
  // }
  loading.style.visibility = 'visible';
  pacienciamsg.style.visibility = 'visible';

  window.cleaned = []


  const processFile = async (file) => {
    if (!verificarPDF(file)) {
      errormsg.textContent = 'Alguno de los archivos seleccionados no tiene extensión .pdf';
      numFiles--;
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
    decrypted_pdf = await window.decrypt_pdf(data)
    if (decrypt_pdf == null) {
        change_to_error_page()
        return
    }

    //We clean the pdf 
    cleaned_pdf = await window.clean_pdf(decrypted_pdf)
    if (cleaned_pdf == null) {
        change_to_error_page()
        return
    }

    //We add the cleaned pdf to the array
    window.cleaned.push([cleaned_pdf, file.name])

    // const formData = new FormData();
    // formData.append("file", file);
    // try {
    //   //https://shrouded-shelf-55195.herokuapp.com/upload
    //   // https://infinite-journey-17186.herokuapp.com/upload
    //   //http://localhost:5000/upload
    //   const response = await fetch("https://infinite-journey-17186.herokuapp.com/upload", {
    //     method: "POST",
    //     body: formData,
    //   });
    //   if (response.ok) {
    //     const blob = await response.blob();
    //     let fileName = file.name;
    //     const extension = fileName.split(".").pop();
    //     const name = fileName.split(".").shift();
    //     const newFileName = name + "_limpiapuntes." + extension;
    //     if (numFiles > 1 && checked) {
    //       zip.file(newFileName, blob);
    //     } else {
    //       const url = URL.createObjectURL(blob);
    //       await downloadFile(newFileName, url);
    //     }
    //   } else {
    //     const contentType = response.headers.get("Content-Type");
    //     if (contentType.includes("application/json")) {
    //       const responseData = await response.json();
    //       errormsg3.textContent = responseData.Error;
    //     }
    //   }
    // } catch (error) {
    //   errormsg2.textContent = "Parece que no tienes conexión a internet o el servidor no funciona correctamente.";
    //   console.log(error);
    // }
  };
  const filesArray = Array.from(files);
  for (const file of filesArray) {
    await processFile(file);
  }
  // if (checked) {
  //   zip.generateAsync({ type: "blob" }).then(function (content) {
  //     const url_zip = URL.createObjectURL(content);
  //     downloadFile("procesados_limpiapuntes.zip", url_zip);
  //   });
  // }
  loading.style.visibility = 'hidden';
  infomsg.textContent = ""
  pacienciamsg.style.visibility = 'hidden';

  downloadFile();
}

// async function downloadFile(d_fileName, d_url) {
//   chrome.downloads.download({
//       url: d_url,
//       filename: d_fileName,
//       saveAs: false
//   });
// }

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