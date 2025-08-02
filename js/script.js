document.addEventListener('DOMContentLoaded', () => {

    // ===================================================================================
    // FUNGSI UTAMA & PEMUATAN DATA
    // ===================================================================================

    // Fungsi utama yang akan dijalankan setelah data materi berhasil dimuat
    function initializeApp(materiData) {
        // Logika yang bergantung pada data materi dijalankan di sini
        setupMateriPage(materiData);
        setupMateriDetailPage(materiData);
    }

    // Mengambil data materi dari file JSON
    async function loadMateriData() {
        try {
            const response = await fetch('data/materi.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const materiData = await response.json();
            initializeApp(materiData); // Jalankan aplikasi utama setelah data siap
        } catch (error) {
            console.error("Gagal memuat data materi:", error);
            // Tampilkan pesan error kepada pengguna jika ada elemen yang relevan
            const materiGrid = document.getElementById('materi-grid');
            if (materiGrid) {
                materiGrid.innerHTML = `<p class="error-message">Gagal memuat materi. Silakan coba lagi nanti.</p>`;
            }
        }
    }

    // Panggil fungsi untuk memuat data
    loadMateriData();

    // ===================================================================================
    // LOGIKA GLOBAL (TIDAK BERGANTUNG PADA DATA MATERI)
    // ===================================================================================

    const themeToggle = document.getElementById('theme-toggle');
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Terapkan tema dari localStorage saat halaman dimuat
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark-mode');
    }

    // Event listener untuk tombol tema
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark-mode');
        const theme = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    });

    // Event listener untuk menu mobile
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Animasi fade-in saat elemen masuk viewport
    const faders = document.querySelectorAll('.fade-in');
    if (faders.length > 0) {
        const appearOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
        const appearOnScroll = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, appearOptions);

        faders.forEach(fader => appearOnScroll.observe(fader));
    }


    // ===================================================================================
    // LOGIKA HALAMAN MATERI (materi.html)
    // ===================================================================================
    function setupMateriPage(materiData) {
        const materiGrid = document.getElementById('materi-grid');
        if (!materiGrid) return; // Keluar jika bukan di halaman materi

        const searchBar = document.getElementById('search-bar');
        const filterKategori = document.getElementById('filter-kategori');
        const filterTahun = document.getElementById('filter-tahun');
        const noResults = document.getElementById('no-results');

        function renderMateri(items) {
            materiGrid.innerHTML = '';
            if (items.length === 0) {
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
                items.forEach(item => {
                    const card = document.createElement('a');
                    card.href = `materi-detail.html?id=${item.id}`;
                    card.className = 'materi-card';
                    card.innerHTML = `
                        <div class="card-content">
                            <h3>${item.title}</h3>
                            <p>${item.desc}</p>
                            <div class="card-tags">
                                <span class="tag">${item.kategori}</span>
                                <span class="tag">${item.tahun}</span>
                            </div>
                        </div>
                    `;
                    materiGrid.appendChild(card);
                });
            }
        }

        function filterAndRender() {
            const searchTerm = searchBar.value.toLowerCase();
            const kategori = filterKategori.value;
            const tahun = filterTahun.value;

            const filteredMateri = materiData.filter(item => {
                const matchesSearch = item.title.toLowerCase().includes(searchTerm) || item.desc.toLowerCase().includes(searchTerm);
                const matchesKategori = kategori === 'all' || item.kategori === kategori;
                const matchesTahun = tahun === 'all' || item.tahun.toString() === tahun;
                return matchesSearch && matchesKategori && matchesTahun;
            });

            renderMateri(filteredMateri);
        }

        searchBar.addEventListener('input', filterAndRender);
        filterKategori.addEventListener('change', filterAndRender);
        filterTahun.addEventListener('change', filterAndRender);

        renderMateri(materiData);
    }

    // ===================================================================================
    // LOGIKA HALAMAN DETAIL MATERI (materi-detail.html)
    // ===================================================================================
    function setupMateriDetailPage(materiData) {
        const materiContentContainer = document.getElementById('materi-content-container');
        if (!materiContentContainer) return; // Keluar jika bukan di halaman detail

        const params = new URLSearchParams(window.location.search);
        const materiId = parseInt(params.get('id'));
        const materi = materiData.find(m => m.id === materiId);

        if (materi) {
            document.title = `${materi.title} - TKJ Learning Hub`;
            
            let referencesHTML = '';
            if (materi.references && materi.references.length > 0) {
                referencesHTML = `
                    <div class="references">
                        <h3>Referensi</h3>
                        <ul>
                            ${materi.references.map(ref => `<li><a href="${ref.url}" target="_blank" rel="noopener noreferrer">${ref.name}</a></li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            materiContentContainer.innerHTML = `
                <h1>${materi.title}</h1>
                <p class="meta-info">Kategori: ${materi.kategori} | Tahun: ${materi.tahun}</p>
                <img src="${materi.image}" alt="${materi.title}" class="content-image">
                ${materi.content}
                ${referencesHTML}
            `;
        } else {
            materiContentContainer.innerHTML = `<p class="error-message">Materi tidak ditemukan. Silakan kembali ke <a href="materi.html">daftar materi</a>.</p>`;
            document.title = 'Materi Tidak Ditemukan - TKJ Learning Hub';
        }
    }


    // ===================================================================================
    // LOGIKA HALAMAN QUIZ (quiz.html)
    // ===================================================================================
    const quizForm = document.getElementById('quiz-form');
    if (quizForm) {
        const quizData = [
            { question: "Layer OSI manakah yang bertanggung jawab untuk pengalamatan logis (IP Address)?", options: ["Layer 1 (Physical)", "Layer 2 (Data Link)", "Layer 3 (Network)", "Layer 4 (Transport)"], answer: 2 },
            { question: "Perangkat yang menghubungkan beberapa segmen jaringan dan bekerja di Layer 3 adalah...", options: ["Hub", "Switch", "Router", "Repeater"], answer: 2 },
            { question: "Topologi jaringan di mana semua komputer terhubung ke satu titik pusat (seperti switch) disebut...", options: ["Bus", "Ring", "Star", "Mesh"], answer: 2 },
            { question: "Protokol yang digunakan untuk mengubah nama domain (misal: google.com) menjadi alamat IP adalah...", options: ["HTTP", "FTP", "DHCP", "DNS"], answer: 3 },
            { question: "Protokol keamanan Wi-Fi yang paling aman saat ini adalah...", options: ["WEP", "WPA", "WPA2", "WPA3"], answer: 3 },
            { question: "Perintah `ping` digunakan untuk...", options: ["Melihat konfigurasi IP", "Melacak rute ke tujuan", "Menguji konektivitas ke host lain", "Menjalankan server web"], answer: 2 }
        ];

        const quizResult = document.getElementById('quiz-result');
        const resultText = document.getElementById('result-text');
        const retryBtn = document.getElementById('retry-quiz-btn');

        function loadQuiz() {
            quizForm.innerHTML = '';
            quizData.forEach((q, index) => {
                let optionsHTML = q.options.map((option, i) => `
                    <label>
                        <input type="radio" name="question${index}" value="${i}">
                        <span>${option}</span>
                    </label>
                `).join('');

                const questionElement = document.createElement('div');
                questionElement.className = 'quiz-question';
                questionElement.id = `question-${index}`;
                questionElement.innerHTML = `<p>${index + 1}. ${q.question}</p><div class="quiz-options">${optionsHTML}</div>`;
                quizForm.appendChild(questionElement);
            });
            const submitButton = document.createElement('button');
            submitButton.type = 'submit';
            submitButton.className = 'cta-button';
            submitButton.textContent = 'Selesai & Lihat Hasil';
            quizForm.appendChild(submitButton);
        }

        quizForm.addEventListener('submit', e => {
            e.preventDefault();
            let score = 0;
            quizData.forEach((q, index) => {
                const questionContainer = document.getElementById(`question-${index}`);
                questionContainer.classList.remove('correct', 'incorrect');
                const selected = document.querySelector(`input[name="question${index}"]:checked`);
                if (selected && parseInt(selected.value) === q.answer) {
                    score++;
                    questionContainer.classList.add('correct');
                } else {
                    questionContainer.classList.add('incorrect');
                }
            });

            quizForm.style.display = 'none';
            quizResult.style.display = 'block';
            resultText.textContent = `Anda benar ${score} dari ${quizData.length} soal!`;
        });

        retryBtn.addEventListener('click', () => {
             quizResult.style.display = 'none';
             quizForm.style.display = 'block';
             quizForm.reset();
             document.querySelectorAll('.quiz-question').forEach(el => el.classList.remove('correct', 'incorrect'));
             window.scrollTo(0,0);
        });
        
        loadQuiz();
    }
    
    // ===================================================================================
    // LOGIKA HALAMAN TENTANG (tentang.html)
    // ===================================================================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const formStatus = document.getElementById('form-status');
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            formStatus.textContent = 'Terima kasih! Pesan Anda telah "dikirim". (Ini adalah demo)';
            formStatus.style.color = 'var(--primary-color)';
            contactForm.reset();
            setTimeout(() => { formStatus.textContent = ''; }, 5000);
        });
    }
});
