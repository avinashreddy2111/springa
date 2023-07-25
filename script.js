// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAmyekaxeDloDmUnLRcmqyELhduTIe1FgE",
    authDomain: "tree-tales.firebaseapp.com",
    projectId: "tree-tales",
    storageBucket: "tree-tales.appspot.com",
    messagingSenderId: "486024968131",
    appId: "1:486024968131:web:bbaff7f3e0e9b1312c2f76",
    measurementId: "G-CS2DGKLKRN"
};

firebase.initializeApp(firebaseConfig);

// Get references to Firebase Firestore and Storage
var db = firebase.firestore();
var storage = firebase.storage();

// Function to load Diary

function loadDiary() {
    var date = document.getElementById('date').value;
    var diaryRef = db.collection('diary').doc(date);

    diaryRef.get().then(function (doc) {
        if (doc.exists) {
            var data = doc.data();
            document.getElementById('notes').value = data.notes;
            var attachmentContainer = document.getElementById('attachmentContainer');
            attachmentContainer.innerHTML = ''; // Clear the attachment container

            if (data.attachment && typeof data.attachment === 'object') {
                for (var attachmentId in data.attachment) {
                    if (data.attachment.hasOwnProperty(attachmentId)) {
                        var attachmentBase64 = data.attachment[attachmentId];
                        var attachmentImage = document.createElement('img');
                        attachmentImage.src = attachmentBase64;
                        attachmentImage.classList.add('attachment-image');
                        attachmentContainer.appendChild(attachmentImage);
                    }
                }
            } else if (data.attachment && typeof data.attachment === 'string') {
                var attachmentImage = document.createElement('img');
                attachmentImage.src = data.attachment;
                attachmentImage.classList.add('attachment-image');
                attachmentContainer.appendChild(attachmentImage);
            }
        } else {
            document.getElementById('notes').value = '';
            document.getElementById('attachmentContainer').innerHTML = '';
        }
    }).catch(function (error) {
        console.log("Error getting diary:", error);
    });
}

// When saving the diary
var diaryRef = db.collection('diary').doc(date);
diaryRef.set({
    notes: notes,
    attachment: base64Strings, // base64Strings is an array of attachment strings
})


// Function to save diary
function saveDiary() {
    var date = document.getElementById('date').value;
    var notes = document.getElementById('notes').value;
    var fileInput = document.getElementById('attachments');
    var files = fileInput.files;
    var attachmentPromises = [];

    // Iterate over each selected file
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        attachmentPromises.push(resizeAndConvertToBase64(file));
    }

    // Wait for all promises to resolve
    Promise.all(attachmentPromises)
        .then(function (base64Strings) {
            var diaryRef = db.collection('diary').doc(date);
            diaryRef.set({
                notes: notes,
                attachment: base64Strings
            })
                .then(function () {
                    console.log("Diary saved successfully!");
                    alert("Diary saved successfully!");

                    // Clear the input fields
                    document.getElementById('notes').value = '';
                    document.getElementById('attachments').value = '';
                    document.getElementById('date').value = '';
                })
                .catch(function (error) {
                    console.error("Error saving diary: ", error);
                });
        })
        .catch(function (error) {
            console.error("Error reading attachments: ", error);
        });
}

// Helper function to resize and convert file to base64
function resizeAndConvertToBase64(file) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var img = new Image();
            img.onload = function () {
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                var MAX_WIDTH = 800; // Maximum width for resized image
                var MAX_HEIGHT = 800; // Maximum height for resized image
                var width = img.width;
                var height = img.height;

                // Calculate the new dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                // Resize the image
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Convert the resized image to base64 string
                var base64String = canvas.toDataURL(file.type);

                resolve(base64String);
            };
            img.src = event.target.result;
        };
        reader.onerror = function (error) {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}



// Function to delete diary for the selected date

function deleteDiary() {
    var date = document.getElementById('date').value;
    var diaryRef = db.collection('diary').doc(date);

    var confirmed = confirm("Are you sure you want to delete this diary entry?");
    if (confirmed) {
        diaryRef.delete().then(function () {
            alert("Diary deleted successfully!");
            document.getElementById('notes').value = '';
            document.getElementById('date').value = ''; // Reset the date input
            document.getElementById('attachmentContainer').innerHTML = '';
        }).catch(function (error) {
            console.error("Error deleting diary: ", error);
        });
    } else {
        console.log("Deletion cancelled by user.");
        confirm("Deletion cancelled by user.")
    }
}

