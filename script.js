// 사용자 정보 저장소
class DiaryApp {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.diaries = this.loadDiaries();
        this.selectedMood = '';
        this.selectedImage = null;
        this.initializeApp();
    }

    // LocalStorage에서 사용자 데이터 로드
    loadUsers() {
        const stored = localStorage.getItem('users');
        return stored ? JSON.parse(stored) : {};
    }

    // LocalStorage에서 일기 데이터 로드
    loadDiaries() {
        const stored = localStorage.getItem('diaries');
        return stored ? JSON.parse(stored) : {};
    }

    // 사용자 데이터 저장
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // 일기 데이터 저장
    saveDiaries() {
        localStorage.setItem('diaries', JSON.stringify(this.diaries));
    }

    // 앱 초기화
    initializeApp() {
        this.setupEventListeners();
        this.checkLoggedInUser();
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 로그인/회원가입 토글
        document.getElementById('toSignup').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthForms();
        });

        document.getElementById('toLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthForms();
        });

        // 로그인 폼
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // 회원가입 폼
        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.signup();
        });

        // 로그아웃
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // 일기 저장
        document.getElementById('saveDiaryBtn').addEventListener('click', () => {
            this.saveDiary();
        });

        // 기분 선택 버튼
        const moodBtns = document.querySelectorAll('.mood-btn');
        moodBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectMood(e.target.getAttribute('data-mood'), btn);
            });
        });

        // 사진 업로드
        document.getElementById('diaryImage').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });

        // 오늘 날짜 기본값
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('diaryDate').value = today;
    }

    // 기분 선택
    selectMood(mood, btn) {
        // 이전 선택 제거
        document.querySelectorAll('.mood-btn').forEach(b => {
            b.classList.remove('active');
        });

        // 새로운 선택 추가
        btn.classList.add('active');
        this.selectedMood = mood;
        
        // 선택한 기분 표시
        const moodDisplay = document.getElementById('moodDisplay');
        moodDisplay.textContent = `선택한 기분: ${mood}`;
        
        // 숨겨진 입력값에 저장
        document.getElementById('selectedMood').value = mood;
    }

    // 사진 업로드 처리
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                this.selectedImage = event.target.result;
                this.displayImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    // 사진 미리보기 표시
    displayImagePreview(imageData) {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `
            <div class="image-preview-container">
                <img src="${imageData}" alt="미리보기">
                <button type="button" class="remove-image-btn" onclick="app.removeImage()">×</button>
            </div>
        `;
    }

    // 사진 제거
    removeImage() {
        this.selectedImage = null;
        document.getElementById('diaryImage').value = '';
        document.getElementById('imagePreview').innerHTML = '';
    }

    // 인증 폼 토글
    toggleAuthForms() {
        const loginContainer = document.getElementById('loginContainer');
        const signupContainer = document.getElementById('signupContainer');
        
        loginContainer.style.display = loginContainer.style.display === 'none' ? 'flex' : 'none';
        signupContainer.style.display = signupContainer.style.display === 'none' ? 'flex' : 'none';
    }

    // 회원가입
    signup() {
        const username = document.getElementById('newUsername').value.trim();
        const password = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!username || !password || !confirmPassword) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        if (password !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (password.length < 4) {
            alert('비밀번호는 최소 4자 이상이어야 합니다.');
            return;
        }

        if (this.users[username]) {
            alert('이미 존재하는 아이디입니다.');
            return;
        }

        // 사용자 등록
        this.users[username] = {
            password: password,
            createdAt: new Date().toLocaleString()
        };

        this.saveUsers();

        alert('회원가입이 완료되었습니다! 로그인해주세요.');
        document.getElementById('signupForm').reset();
        this.toggleAuthForms();
    }

    // 로그인
    login() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            alert('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        if (!this.users[username]) {
            alert('존재하지 않는 아이디입니다.');
            return;
        }

        if (this.users[username].password !== password) {
            alert('비밀번호가 틀렸습니다.');
            return;
        }

        this.currentUser = username;
        localStorage.setItem('currentUser', username);
        this.showDiaryView();
    }

    // 로그아웃
    logout() {
        if (confirm('로그아웃하시겠습니까?')) {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            this.showLoginView();
        }
    }

    // 로그인된 사용자 확인
    checkLoggedInUser() {
        const stored = localStorage.getItem('currentUser');
        if (stored && this.users[stored]) {
            this.currentUser = stored;
            this.showDiaryView();
        } else {
            this.showLoginView();
        }
    }

    // 로그인 뷰 표시
    showLoginView() {
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('signupContainer').style.display = 'none';
        document.getElementById('diaryContainer').style.display = 'none';
        document.getElementById('loginForm').reset();
    }

    // 일기장 뷰 표시
    showDiaryView() {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('signupContainer').style.display = 'none';
        document.getElementById('diaryContainer').style.display = 'block';
        document.getElementById('currentUser').textContent = `${this.currentUser}님`;
        this.loadDiaryList();
    }

    // 일기 저장
    saveDiary() {
        const title = document.getElementById('diaryTitle').value.trim();
        const content = document.getElementById('diaryContent').value.trim();
        const date = document.getElementById('diaryDate').value;

        if (!title || !content) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        if (!this.diaries[this.currentUser]) {
            this.diaries[this.currentUser] = [];
        }

        const diary = {
            id: Date.now(),
            title: title,
            content: content,
            date: date,
            mood: this.selectedMood,
            image: this.selectedImage,
            createdAt: new Date().toLocaleString()
        };

        this.diaries[this.currentUser].push(diary);
        this.saveDiaries();

        alert('일기가 저장되었습니다!');
        this.resetDiaryForm();
        this.loadDiaryList();
    }

    // 일기 폼 초기화
    resetDiaryForm() {
        document.getElementById('diaryTitle').value = '';
        document.getElementById('diaryContent').value = '';
        document.getElementById('selectedMood').value = '';
        document.getElementById('moodDisplay').textContent = '';
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.selectedMood = '';
        this.removeImage();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('diaryDate').value = today;
    }

    // 일기 목록 로드
    loadDiaryList() {
        const diaryList = document.getElementById('diaryList');
        diaryList.innerHTML = '';

        const userDiaries = this.diaries[this.currentUser] || [];

        if (userDiaries.length === 0) {
            diaryList.innerHTML = '<div class="empty-message">작성한 일기가 없습니다. 오늘의 일기를 작성해보세요!</div>';
            return;
        }

        // 최신순으로 정렬
        const sortedDiaries = [...userDiaries].sort((a, b) => b.id - a.id);

        sortedDiaries.forEach(diary => {
            const diaryItem = document.createElement('div');
            diaryItem.className = 'diary-item';
            
            let imageHtml = '';
            if (diary.image) {
                imageHtml = `<img src="${diary.image}" alt="일기 사진" class="diary-item-image">`;
            }

            let moodHtml = '';
            if (diary.mood) {
                moodHtml = `<span class="diary-item-mood">${diary.mood}</span>`;
            }

            diaryItem.innerHTML = `
                <div class="diary-item-header">
                    <div>
                        <div class="diary-item-title">${moodHtml}${this.escapeHtml(diary.title)}</div>
                        <div class="diary-item-date">${diary.date}</div>
                    </div>
                </div>
                ${imageHtml}
                <div class="diary-item-content">${this.escapeHtml(diary.content)}</div>
                <div class="diary-item-actions">
                    <button class="btn-delete" onclick="app.deleteDiary(${diary.id})">삭제</button>
                </div>
            `;
            diaryList.appendChild(diaryItem);
        });
    }

    // 일기 삭제
    deleteDiary(id) {
        if (confirm('정말로 삭제하시겠습니까?')) {
            this.diaries[this.currentUser] = this.diaries[this.currentUser].filter(d => d.id !== id);
            this.saveDiaries();
            this.loadDiaryList();
        }
    }

    // XSS 방지를 위한 HTML 이스케이프
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 앱 시작
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new DiaryApp();
});
