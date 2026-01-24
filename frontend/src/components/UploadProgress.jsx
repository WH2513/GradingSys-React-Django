function uploadWithProgress(file, url, onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", url);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    onProgress(percent);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) resolve();
                else reject(new Error("Upload failed"));
            };

            xhr.onerror = () => reject(new Error("Network error"));

            // xhr.setRequestHeader("Content-Type", file.type);
            xhr.send(file);
        });
    }
    export default uploadWithProgress;