// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', function () {
    // Check login status on page load
    checkLoginStatus();
  
    // Initialize PDF list on page load
    displayPDFList();
  
    // Handle search input for PDFs
    document.getElementById('searchBar').addEventListener('input', searchPDFs);
  });
  
  // Function to check if the user is logged in
  function checkLoginStatus() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      window.location.href = 'login.html';  // Replace with your actual login page URL
    }
  }
  
  // Function to handle PDF file upload
  function uploadPDF() {
    const file = document.getElementById('pdfInput').files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 10 * 1024 * 1024) { // 10MB size limit
        showNotification('❌ File is too large. Please upload a PDF under 10MB.', 'error');
        return;
      }
  
      const reader = new FileReader();
      reader.onload = function (e) {
        const pdfContent = e.target.result; // This is a complete data URL
        const pdfName = file.name;
        const pdfSize = (file.size / 1024 / 1024).toFixed(2); // in MB
        const currentUser = localStorage.getItem('currentUser');
  
        // Get uploaded PDFs from localStorage
        let uploadedPDFs = JSON.parse(localStorage.getItem('uploadedPDFs')) || [];
  
        // Add new PDF to the list
        uploadedPDFs.push({
          name: pdfName,
          content: pdfContent,
          size: pdfSize,
          uploader: currentUser
        });
  
        // Save the updated PDFs to localStorage
        localStorage.setItem('uploadedPDFs', JSON.stringify(uploadedPDFs));
        showNotification(`✅ "${pdfName}" has been uploaded successfully!`, 'success');
        displayPDFList();  // Re-render the PDF list
      };
      reader.readAsDataURL(file);
    } else {
      showNotification('❌ Please upload a valid PDF file.', 'error');
    }
  }
  
  // Function to show notifications
  function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.innerText = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
  
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
  
  // Function to display the uploaded PDFs with options to Replace or Delete
  function displayPDFList() {
    const pdfListContainer = document.getElementById('pdfList');
    pdfListContainer.innerHTML = ''; // Clear previous list
  
    let uploadedPDFs = JSON.parse(localStorage.getItem('uploadedPDFs')) || [];
  
    if (uploadedPDFs.length === 0) {
      pdfListContainer.innerHTML = '<p>No PDFs uploaded yet.</p>';
      return;
    }
  
    uploadedPDFs.forEach((pdf, index) => {
      const pdfItem = document.createElement('div');
      pdfItem.className = 'pdfItem';
      pdfItem.innerHTML = `
        <div class="file-info">
          <img src="https://via.placeholder.com/150" alt="PDF Thumbnail" class="file-thumbnail">
          <strong>${pdf.name}</strong><br>
          <small>Size: ${pdf.size} MB</small><br>
          <a href="${pdf.content}" target="_blank">View PDF</a>
        </div>
        <div class="pdf-actions">
          ${
            pdf.uploader === localStorage.getItem('currentUser')
              ? isRestrictedUser()
                ? `<button class="put" onclick="replacePDF(${index})">Replace</button>`
                : `<button class="put" onclick="replacePDF(${index})">Replace</button>
                   <button class="delete" onclick="deletePDF(${index})">Delete</button>`
              : ''
          }
        </div>
      `;
      pdfListContainer.appendChild(pdfItem);
    });
  }
  
  // Function to check if the current user is restricted
  function isRestrictedUser() {
    const currentUser = localStorage.getItem('currentUser');
    const currentPassword = localStorage.getItem('currentPassword');
    return currentUser === 'JOB CV' && currentPassword === 'Nepaljobcv@123';
  }
  
  // Function to replace an existing PDF with a new one
  function replacePDF(index) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf';
    fileInput.onchange = function (event) {
      // Replace the old PDF with the new one (re-upload process)
      const file = event.target.files[0];
  
      if (file && file.type === 'application/pdf') {
        if (file.size > 10 * 1024 * 1024) { // 10MB size limit
          showNotification('❌ File is too large. Please upload a PDF under 10MB.', 'error');
          return;
        }
  
        const reader = new FileReader();
        reader.onload = function (e) {
          const pdfContent = e.target.result;
          const pdfName = file.name;
          const pdfSize = (file.size / 1024 / 1024).toFixed(2);
          let uploadedPDFs = JSON.parse(localStorage.getItem('uploadedPDFs')) || [];
  
          // Replace the old PDF with the new one
          uploadedPDFs[index] = {
            name: pdfName,
            content: pdfContent,
            size: pdfSize,
            uploader: localStorage.getItem('currentUser')
          };
  
          localStorage.setItem('uploadedPDFs', JSON.stringify(uploadedPDFs));
          showNotification(`✅ PDF "${pdfName}" has been replaced successfully!`, 'success');
          displayPDFList();
        };
        reader.readAsDataURL(file);
      } else {
        showNotification('❌ Please upload a valid PDF file.', 'error');
      }
    };
    fileInput.click();
  }
  
  // Function to delete a PDF from the list
  function deletePDF(index) {
    let uploadedPDFs = JSON.parse(localStorage.getItem('uploadedPDFs')) || [];
  
    const pdf = uploadedPDFs[index];
  
    if (pdf.uploader === localStorage.getItem('currentUser')) {
      // Only allow the uploader to delete their file
      uploadedPDFs.splice(index, 1); // Remove the PDF from the array
      localStorage.setItem('uploadedPDFs', JSON.stringify(uploadedPDFs));
      displayPDFList(); // Re-render the list
      showNotification('✅ PDF has been deleted successfully!', 'success');
    } else {
      showNotification("❌ You can only delete files that you uploaded.", 'error');
    }
  }
  
  // Function to search through the uploaded PDFs
  function searchPDFs() {
    const searchQuery = document.getElementById('searchBar').value.toLowerCase();
    const uploadedPDFs = JSON.parse(localStorage.getItem('uploadedPDFs')) || [];
  
    const filteredPDFs = uploadedPDFs.filter(pdf => pdf.name.toLowerCase().includes(searchQuery));
  
    const pdfListContainer = document.getElementById('pdfList');
    pdfListContainer.innerHTML = ''; // Clear previous list
  
    if (filteredPDFs.length === 0) {
      pdfListContainer.innerHTML = '<p>No results found.</p>';
      return;
    }
  
    filteredPDFs.forEach((pdf, index) => {
      const pdfItem = document.createElement('div');
      pdfItem.className = 'pdfItem';
      pdfItem.innerHTML = `
        <div class="file-info">
          <img src="https://via.placeholder.com/150" alt="PDF Thumbnail" class="file-thumbnail">
          <strong>${pdf.name}</strong><br>
          <small>Size: ${pdf.size} MB</small><br>
          <a href="${pdf.content}" target="_blank">View PDF</a>
        </div>
        <div class="pdf-actions">
          ${
            pdf.uploader === localStorage.getItem('currentUser') && !isRestrictedUser()
              ? `<button class="put" onclick="replacePDF(${index})">Replace</button>
                 <button class="delete" onclick="deletePDF(${index})">Delete</button>`
              : (pdf.uploader === localStorage.getItem('currentUser') && isRestrictedUser()
                ? `<button class="put" onclick="replacePDF(${index})">Replace</button>`
                : '')
          }
        </div>
      `;
      pdfListContainer.appendChild(pdfItem);
    });
  }
  