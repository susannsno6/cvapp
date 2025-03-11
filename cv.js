// Ensure the user is logged in before interacting with the page
function checkLoginStatus() {
    const loggedInUser = sessionStorage.getItem("loggedInUser");
    if (!loggedInUser) {
        alert("You must log in first!");
        window.location.href = "index.html"; // Redirect to login page if not logged in
    }
}

// Function to display uploaded PDFs with Replace and Delete buttons
function displayPDFList(filteredPDFs = null) {
    const pdfListContainer = document.getElementById("pdfList");
    pdfListContainer.innerHTML = ""; // Clear previous content

    const storedPDFs = JSON.parse(localStorage.getItem("pdfFiles")) || [];
    const pdfsToDisplay = filteredPDFs || storedPDFs; // If filteredPDFs is passed, use it; otherwise, use all PDFs.

    if (pdfsToDisplay.length === 0) {
        pdfListContainer.innerHTML = "<p>No PDFs uploaded yet.</p>";
        return;
    }

    pdfsToDisplay.forEach((pdf, index) => {
        const pdfElement = document.createElement("div");
        pdfElement.classList.add("pdf-item");

        // Check if the logged-in user is authorized to delete PDFs
        const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
        const deleteButton = (loggedInUser.username === "9769761579" && loggedInUser.password === "Puspa Khanal") 
            ? `<button class="delete-btn" onclick="deletePDF(${index})">❌ Delete</button>` 
            : ''; // Only authorized user can see and click delete button

        pdfElement.innerHTML = `
            <div class="pdf-details">
                <!-- Thumbnail for PDF using the NCV logo -->
                <img src="ncv logo.jpg" alt="PDF Thumbnail" class="file-thumbnail">
                <a href="${pdf.data}" target="_blank">${pdf.name}</a>
            </div>
            <div class="pdf-actions">
                <button class="replace-btn" onclick="replacePDF(${index})">🔄 Replace</button>
                ${deleteButton} <!-- Conditionally rendered delete button -->
            </div>
        `;

        pdfListContainer.appendChild(pdfElement);
    });
}

// Function to search PDFs
function searchPDFs() {
    const searchQuery = document.getElementById("searchInput").value.toLowerCase();
    const storedPDFs = JSON.parse(localStorage.getItem("pdfFiles")) || [];

    // Filter PDFs based on the search query
    const filteredPDFs = storedPDFs.filter(pdf => pdf.name.toLowerCase().includes(searchQuery));

    // Display the filtered list
    displayPDFList(filteredPDFs);
}

// Function to replace a PDF
function replacePDF(index) {
    const newFileInput = document.createElement("input");
    newFileInput.type = "file";
    newFileInput.accept = "application/pdf";
    newFileInput.onchange = function (event) {
        const newFile = event.target.files[0];

        if (newFile && newFile.type === "application/pdf" && newFile.size <= 10 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const fileData = event.target.result;
                const storedPDFs = JSON.parse(localStorage.getItem("pdfFiles")) || [];

                // Replace the PDF data
                storedPDFs[index] = { name: newFile.name, data: fileData };
                localStorage.setItem("pdfFiles", JSON.stringify(storedPDFs));

                // Refresh the displayed list
                displayPDFList();
            };
            reader.readAsDataURL(newFile);
        } else {
            alert("Invalid file type or size. Please upload a PDF under 10MB.");
        }
    };

    // Trigger file input dialog
    newFileInput.click();
}

// Function to delete a PDF
function deletePDF(index) {
    const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

    // Ensure only the authorized user can delete PDFs
    if (loggedInUser.username !== "9769761579" || loggedInUser.password !== "Puspa Khanal") {
        alert("You are not authorized to delete PDF files.");
        return;
    }

    let storedPDFs = JSON.parse(localStorage.getItem("pdfFiles")) || [];
    storedPDFs.splice(index, 1);
    localStorage.setItem("pdfFiles", JSON.stringify(storedPDFs));

    // Refresh the displayed list
    displayPDFList();
}

// Function to upload a PDF
function uploadPDF() {
    const pdfInput = document.getElementById("pdfInput");
    const notification = document.getElementById("notification");

    if (pdfInput.files.length === 0) {
        notification.textContent = "❌ Please select a PDF file to upload.";
        notification.style.color = "red";
        return;
    }

    const file = pdfInput.files[0];

    // Check file type
    if (file.type !== "application/pdf") {
        notification.textContent = "❌ Only PDF files are allowed.";
        notification.style.color = "red";
        return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        notification.textContent = "❌ File size must be less than 10MB.";
        notification.style.color = "red";
        return;
    }

    // Convert file to Base64 to store it in localStorage
    const reader = new FileReader();
    reader.onload = function (event) {
        const fileData = event.target.result;
        const storedPDFs = JSON.parse(localStorage.getItem("pdfFiles")) || [];

        // Store the PDF with a unique ID
        storedPDFs.push({ name: file.name, data: fileData });
        localStorage.setItem("pdfFiles", JSON.stringify(storedPDFs));

        // Display success message
        notification.textContent = "✅ PDF uploaded successfully!";
        notification.style.color = "green";

        // Refresh the displayed list
        displayPDFList();
    };

    reader.readAsDataURL(file);
}

// Ensure the user is logged in and display PDFs when the page loads
document.addEventListener("DOMContentLoaded", function() {
    checkLoginStatus();  // Ensure the user is logged in before displaying PDFs
    displayPDFList();
});
