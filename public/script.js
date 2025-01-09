document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrl');
    const getInfoBtn = document.getElementById('getInfo');
    const videoDetails = document.getElementById('videoDetails');
    const videoTitleElement = document.getElementById('videoTitle');
    const qualitySelect = document.getElementById('quality');
    const downloadBtn = document.getElementById('downloadBtn');
    const loader = document.getElementById('loader');
    const errorDiv = document.getElementById('error');
    const errorMessage = document.querySelector('.error-message');

    function showLoader() {
        loader.classList.remove('hidden');
        errorDiv.classList.add('hidden');
    }

    function hideLoader() {
        loader.classList.add('hidden');
    }

    function showError(message) {
        errorDiv.classList.remove('hidden');
        errorMessage.textContent = message;
    }

    getInfoBtn.addEventListener('click', async () => {
        const videoUrl = videoUrlInput.value.trim();
        if (!videoUrl) {
            showError('Please enter a valid YouTube URL');
            return;
        }

        showLoader();
        videoDetails.classList.add('hidden');

        try {
            const response = await fetch(`/video-info?url=${encodeURIComponent(videoUrl)}`);
            const data = await response.json();
            console.log(response)

            if (!response.ok) throw new Error(data.error);

            videoTitleElement.textContent = data.title;
            qualitySelect.innerHTML = data.formats
                .map(format => `<option value="${format.itag}">${format.quality}</option>`)
                .join('');

            videoDetails.classList.remove('hidden');
        } catch (error) {
            showError(error.message || 'Error fetching video information');
        } finally {
            hideLoader();
        }
    });

    downloadBtn.addEventListener('click', () => {
        const videoUrl = videoUrlInput.value.trim();
        const selectedItag = qualitySelect.value;
        
        if (!videoUrl || !selectedItag) {
            showError('Please select a video quality');
            return;
        }

        window.location.href = `/download?url=${encodeURIComponent(videoUrl)}&itag=${selectedItag}`;
    });

    
});


