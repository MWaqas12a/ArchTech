(function() {
    // ---------- Music Library (Mapped to your audio files) ----------
    const library = [
        // First 2 songs → Jazz
        { 
            title: "Jis Dil Vich", 
            artist: "Nusrat Fateh Ali Khan", 
            category: "jazz",
            audioId: "audio1"
        },
        { 
            title: "Jattwad", 
            artist: "Gurlaz Akhtar", 
            category: "jazz",
            audioId: "audio2"
        },
        // Next 2 songs → Rock
        { 
            title: "Jai Tu Akhyan Dai Samnay", 
            artist: "Nusrat Fateh Ali Khan", 
            category: "rock",
            audioId: "audio3"
        },
        { 
            title: "Chandigarh Waliya", 
            artist: "Ranjit Bawa", 
            category: "rock",
            audioId: "audio4"
        },
        // Next 2 songs → Electronic
        { 
            title: "Jia Jia Jia Ni", 
            artist: "Zeeshan Rokhri", 
            category: "electronic",
            audioId: "audio5"
        },
        { 
            title: "Mere Dil Vich", 
            artist: "Babbu Maan", 
            category: "electronic",
            audioId: "audio6"
        },
        // Remaining songs → Pop
        { 
            title: "A Daor Ni Wafa Da", 
            artist: "Basit Naeemi", 
            category: "pop",
            audioId: "audio7"
        },
        { 
            title: "Bazaar 2", 
            artist: "Afsana Khan", 
            category: "pop",
            audioId: "audio8"
        },
        { 
            title: "Gali Teri Se", 
            artist: "Afsana Khan", 
            category: "pop",
            audioId: "audio9"
        },
        { 
            title: "Sadi YAd", 
            artist: "Tahir Nayyar", 
            category: "pop",
            audioId: "audio10"
        },
    ];

    // ---------- State ----------
    let currentFilter = 'all';
    let searchQuery = '';
    let currentIndex = 0;
    let isPlaying = false;

    // DOM refs
    const playlistEl = document.getElementById('playlistContainer');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const currentSongName = document.getElementById('currentSongName');
    const progressSlider = document.getElementById('progressSlider');
    const currentTimeDisplay = document.getElementById('currentTimeDisplay');
    const totalTimeDisplay = document.getElementById('totalTimeDisplay');

    // ---------- Get all audio elements ----------
    const audioElements = {};
    document.querySelectorAll('#audioContainer audio').forEach(audio => {
        audioElements[audio.id] = audio;
        // Preload metadata
        audio.load();
    });

    // Current audio element
    let currentAudio = null;

    // ---------- Helpers ----------
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function getFilteredSongs() {
        let filtered = library;
        if (currentFilter !== 'all') {
            filtered = filtered.filter(s => s.category === currentFilter);
        }
        if (searchQuery.trim() !== '') {
            const q = searchQuery.trim().toLowerCase();
            filtered = filtered.filter(s =>
                s.title.toLowerCase().includes(q) ||
                s.artist.toLowerCase().includes(q)
            );
        }
        return filtered;
    }

    function getCurrentSong() {
        const songs = getFilteredSongs();
        if (songs.length === 0) return null;
        if (currentIndex >= songs.length) currentIndex = 0;
        if (currentIndex < 0) currentIndex = songs.length - 1;
        return songs[currentIndex];
    }

    function getAudioElement(song) {
        if (!song) return null;
        return audioElements[song.audioId] || null;
    }

    // ---------- Audio Event Handlers ----------
    function setupAudioListeners(audio) {
        if (!audio) return;

        // Remove old listeners to avoid duplicates
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('loadedmetadata', updateTotalTime);
        audio.removeEventListener('ended', onAudioEnd);
        audio.removeEventListener('error', onAudioError);

        // Add new listeners
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', updateTotalTime);
        audio.addEventListener('ended', onAudioEnd);
        audio.addEventListener('error', onAudioError);
    }

    function updateProgress() {
        if (!currentAudio || !isPlaying) return;
        const duration = currentAudio.duration;
        if (duration && isFinite(duration) && duration > 0) {
            const progress = (currentAudio.currentTime / duration) * 100;
            progressSlider.value = Math.min(progress, 100);
            currentTimeDisplay.textContent = formatTime(currentAudio.currentTime);
        }
    }

    function updateTotalTime() {
        if (!currentAudio) return;
        const duration = currentAudio.duration;
        if (duration && isFinite(duration) && duration > 0) {
            totalTimeDisplay.textContent = formatTime(duration);
        }
    }

    function onAudioEnd() {
        if (isPlaying) {
            nextSong();
        }
    }

    function onAudioError(e) {
        console.warn('Audio error:', e);
        // Try to continue with next song
        if (isPlaying) {
            nextSong();
        }
    }

    // ---------- Playback Functions ----------
    function playCurrentSong() {
        const song = getCurrentSong();
        if (!song) return;

        // Pause current audio
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        // Get new audio element
        const audio = getAudioElement(song);
        if (!audio) {
            console.warn('Audio element not found for:', song.title);
            return;
        }

        currentAudio = audio;
        setupAudioListeners(audio);

        // Set volume
        audio.volume = parseFloat(volumeSlider.value);

        // Play
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    isPlaying = true;
                    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    currentSongName.textContent = `${song.title} · ${song.artist}`;
                    
                    // Update total time if available
                    if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
                        totalTimeDisplay.textContent = formatTime(audio.duration);
                    }
                    
                    renderPlaylist();
                })
                .catch(error => {
                    console.warn('Playback failed:', error);
                    // Try to load and play again
                    audio.load();
                    setTimeout(() => {
                        audio.play().catch(e => console.warn('Retry failed:', e));
                    }, 100);
                });
        }
    }

    function togglePlay() {
        const song = getCurrentSong();
        if (!song) return;

        if (isPlaying) {
            // Pause
            if (currentAudio) {
                currentAudio.pause();
            }
            isPlaying = false;
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            // Resume or start
            if (currentAudio && currentAudio.src && currentAudio.currentTime > 0) {
                currentAudio.play()
                    .then(() => {
                        isPlaying = true;
                        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    })
                    .catch(() => {
                        playCurrentSong();
                    });
            } else {
                playCurrentSong();
            }
        }
        renderPlaylist();
    }

    function nextSong() {
        const songs = getFilteredSongs();
        if (songs.length === 0) return;
        
        currentIndex = (currentIndex + 1) % songs.length;
        
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        renderPlaylist();
        playCurrentSong();
    }

    function prevSong() {
        const songs = getFilteredSongs();
        if (songs.length === 0) return;
        
        // If current time > 3 seconds, restart current song
        if (currentAudio && currentAudio.currentTime > 3) {
            currentAudio.currentTime = 0;
            if (isPlaying) {
                currentAudio.play();
            }
            return;
        }
        
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
        
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        renderPlaylist();
        playCurrentSong();
    }

    // ---------- Seek ----------
    progressSlider.addEventListener('input', function() {
        if (!currentAudio || !currentAudio.duration || !isFinite(currentAudio.duration)) return;
        const progress = parseFloat(this.value);
        currentAudio.currentTime = (progress / 100) * currentAudio.duration;
        currentTimeDisplay.textContent = formatTime(currentAudio.currentTime);
    });

    // ---------- Volume ----------
    volumeSlider.addEventListener('input', function() {
        if (currentAudio) {
            currentAudio.volume = parseFloat(this.value);
        }
    });

    // ---------- Render Playlist ----------
    function renderPlaylist() {
        const songs = getFilteredSongs();
        if (songs.length === 0) {
            playlistEl.innerHTML = `<div style="padding: 2rem; text-align: center; color: #7a86a8;">🎵 no songs match</div>`;
            currentSongName.textContent = '—';
            totalTimeDisplay.textContent = '0:00';
            return;
        }
        
        if (currentIndex >= songs.length) currentIndex = 0;
        if (currentIndex < 0) currentIndex = songs.length - 1;

        let html = '';
        songs.forEach((song, idx) => {
            const activeClass = (idx === currentIndex) ? 'active' : '';
            // Get duration from audio element
            const audio = getAudioElement(song);
            const duration = audio && audio.duration && isFinite(audio.duration) ? formatTime(audio.duration) : '';
            
            // Get category icon
            let categoryIcon = 'fa-tag';
            if (song.category === 'jazz') categoryIcon = 'fa-saxophone';
            else if (song.category === 'rock') categoryIcon = 'fa-guitar';
            else if (song.category === 'electronic') categoryIcon = 'fa-wave-square';
            else if (song.category === 'pop') categoryIcon = 'fa-music';
            
            html += `
                <div class="song-item ${activeClass}" data-index="${idx}">
                    <div class="info">
                        <span class="title">${song.title}</span>
                        <span class="artist">${song.artist}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        ${duration ? `<span class="duration">${duration}</span>` : ''}
                        <span class="category-badge"><i class="fas ${categoryIcon}"></i> ${song.category}</span>
                    </div>
                </div>
            `;
        });
        playlistEl.innerHTML = html;

        // Update now playing
        const song = getCurrentSong();
        if (song) {
            currentSongName.textContent = `${song.title} · ${song.artist}`;
        }

        // Click to play
        document.querySelectorAll('.song-item').forEach(item => {
            item.addEventListener('click', function() {
                const idx = parseInt(this.dataset.index, 10);
                if (!isNaN(idx)) {
                    currentIndex = idx;
                    renderPlaylist();
                    playCurrentSong();
                }
            });
        });
    }

    // ---------- Navigation & Filters ----------
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            currentIndex = 0;
            
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            
            isPlaying = false;
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            renderPlaylist();
        });
    });

    searchInput.addEventListener('input', function() {
        searchQuery = this.value;
        currentIndex = 0;
        
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        renderPlaylist();
    });

    // ---------- Button Events ----------
    playBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', nextSong);
    prevBtn.addEventListener('click', prevSong);

    // ---------- Keyboard Shortcuts ----------
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT') return;
        
        if (e.code === 'Space') {
            e.preventDefault();
            togglePlay();
        }
        if (e.code === 'ArrowRight') {
            e.preventDefault();
            nextSong();
        }
        if (e.code === 'ArrowLeft') {
            e.preventDefault();
            prevSong();
        }
    });

    // ---------- Handle audio load errors gracefully ----------
    // Preload all audio metadata
    Object.values(audioElements).forEach(audio => {
        audio.addEventListener('loadedmetadata', function() {
            // Duration is now available
            renderPlaylist();
        });
        audio.addEventListener('error', function(e) {
            console.warn('Audio load error for:', audio.src);
        });
    });

    // ---------- Init ----------
    renderPlaylist();
    
    // Set initial song name
    const initial = getCurrentSong();
    if (initial) {
        currentSongName.textContent = `${initial.title} · ${initial.artist}`;
        // Try to load first audio
        const audio = getAudioElement(initial);
        if (audio) {
            audio.load();
            // Get duration if already loaded
            if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
                totalTimeDisplay.textContent = formatTime(audio.duration);
            }
        }
    }

    console.log('🎵 Music Player initialized!');
    console.log('📂 Total songs:', library.length);
    console.log('🎯 Current song:', getCurrentSong()?.title || 'None');
    console.log('🔊 Audio elements loaded:', Object.keys(audioElements).length);
    console.log('📋 Categories:', [...new Set(library.map(s => s.category))]);
})();