const tableBody = document.getElementById('tableBody');
const mainTitle = document.getElementById('mainTitle');
const themeSelect = document.getElementById('themeSelect');
const notesArea = document.getElementById('myNotes');
const colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

function showToast(message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// دالة Untis: إظهار اليوم المحدد فقط على الهواتف
function showDay(dayIndex) {
    // تلوين الزر النشط في الأعلى
    document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
    const tabs = document.querySelectorAll('.day-tab');
    if(tabs[dayIndex-1]) tabs[dayIndex-1].classList.add('active');

    // إخفاء كل الأعمدة وإظهار العمود المطلوب فقط (الخدعة البصرية)
    for(let i=1; i<=5; i++) {
        document.querySelectorAll('.col-' + i).forEach(td => td.classList.remove('active-day'));
    }
    document.querySelectorAll('.col-' + dayIndex).forEach(td => td.classList.add('active-day'));
}

function highlightToday() {
    let today = new Date().getDay(); // 1 = Monday
    if(today < 1 || today > 5) today = 1; // إذا كان السبت أو الأحد، اجعله الإثنين افتراضياً
    
    // تلوين الجدول للكمبيوتر
    if(document.getElementById('th-' + today)) {
        document.getElementById('th-' + today).classList.add('today-col');
        document.querySelectorAll('.col-' + today).forEach(cell => cell.classList.add('today-col'));
    }

    // تفعيل اليوم التلقائي للهاتف
    showDay(today);
}

window.onload = function() {
    if(!localStorage.getItem('proAppOriginal')) { localStorage.setItem('proAppOriginal', tableBody.innerHTML); }
    if(localStorage.getItem('proAppTable')) { tableBody.innerHTML = localStorage.getItem('proAppTable'); }
    if(localStorage.getItem('proAppTitle')) { mainTitle.innerHTML = localStorage.getItem('proAppTitle'); }
    if(localStorage.getItem('proAppNotes')) { notesArea.value = localStorage.getItem('proAppNotes'); }
    
    const savedTheme = localStorage.getItem('proAppTheme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    themeSelect.value = savedTheme;

    highlightToday();
    setupDragAndDrop(); 
};

function saveTitle() { localStorage.setItem('proAppTitle', mainTitle.innerHTML); }
function saveData() { 
    localStorage.setItem('proAppTable', tableBody.innerHTML);
    setupDragAndDrop(); 
}
function saveNotes() { localStorage.setItem('proAppNotes', notesArea.value); }

function changeTheme() {
    const selectedTheme = themeSelect.value;
    document.body.setAttribute('data-theme', selectedTheme);
    localStorage.setItem('proAppTheme', selectedTheme);
    showToast('تم تغيير المظهر بنجاح 🎨');
}

function changeColor(btn) {
    let card = btn.closest('.class-card');
    let currentIndex = parseInt(card.getAttribute('data-color-index') || '0');
    let nextIndex = (currentIndex + 1) % colors.length;
    card.style.borderRightColor = colors[nextIndex];
    card.setAttribute('data-color-index', nextIndex);
    saveData();
}

function removeCard(btn) {
    let td = btn.closest('td');
    let colClass = Array.from(td.classList).find(c => c.startsWith('col-')) || '';
    let todayClass = td.classList.contains('today-col') ? ' today-col' : '';
    let activeDayClass = td.classList.contains('active-day') ? ' active-day' : '';
    
    td.className = `${colClass} ${todayClass} ${activeDayClass} drop-zone`;
    td.innerHTML = `<div class="empty-slot" onclick="addCard(this)"></div>`;
    saveData();
    showToast('تم حذف المادة 🗑️');
}

function addCard(slot) {
    let td = slot.closest('td');
    td.innerHTML = `
        <div class="class-card" draggable="true" data-color-index="0" style="border-right-color: #3b82f6;">
            <div class="card-controls" contenteditable="false">
                <button class="color-btn" onclick="changeColor(this)">🎨</button>
                <button class="delete-btn" onclick="removeCard(this)">🗑️</button>
            </div>
            <div contenteditable="true" oninput="saveData()"><div class="class-title">مادة جديدة</div><div class="class-info">القاعة/المدرس</div></div>
        </div>
    `;
    saveData();
    showToast('تمت إضافة مادة جديدة ✨');
}

function addTimeRow(position) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="time-col" contenteditable="true" oninput="saveData()">00:00<br>00:00</td>
        <td class="col-1 drop-zone"><div class="empty-slot" onclick="addCard(this)"></div></td>
        <td class="col-2 drop-zone"><div class="empty-slot" onclick="addCard(this)"></div></td>
        <td class="col-3 drop-zone"><div class="empty-slot" onclick="addCard(this)"></div></td>
        <td class="col-4 drop-zone"><div class="empty-slot" onclick="addCard(this)"></div></td>
        <td class="col-5 drop-zone"><div class="empty-slot" onclick="addCard(this)"></div></td>
    `;
    if (position === 'top') { tableBody.insertBefore(tr, tableBody.firstChild); } 
    else { tableBody.appendChild(tr); }
    highlightToday(); // لإعادة تفعيل العمود النشط على الصف الجديد
    saveData();
    showToast('تمت إضافة وقت جديد ⏰');
}

function exportToImage() {
    const captureArea = document.getElementById('captureArea');
    const btn = document.getElementById('captureBtn');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '⏳ جاري الالتقاط...';
    let bgColor = getComputedStyle(document.body).backgroundColor;

    html2canvas(captureArea, { backgroundColor: bgColor, scale: 2, useCORS: true }).then(canvas => {
        let link = document.createElement('a');
        link.download = 'جدول_الجامعة_Pro.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        btn.innerHTML = originalText;
        showToast('تم حفظ الصورة بنجاح! 📸');
    }).catch(err => {
        alert("حدث خطأ في التصوير.");
        btn.innerHTML = originalText;
    });
}

function clearData() {
    if(confirm('هل أنت متأكد من مسح كل التعديلات وإعادة الجدول الأصلي؟')) {
        tableBody.innerHTML = localStorage.getItem('proAppOriginal');
        notesArea.value = '';
        localStorage.setItem('proAppNotes', '');
        saveData();
        location.reload();
    }
}

// ميزة السحب والإفلات
let draggedCard = null;
let sourceZone = null;

function setupDragAndDrop() {
    const cards = document.querySelectorAll('.class-card');
    const dropZones = document.querySelectorAll('.drop-zone');

    cards.forEach(card => {
        card.addEventListener('dragstart', function(e) {
            draggedCard = this;
            sourceZone = this.closest('.drop-zone');
            setTimeout(() => this.classList.add('dragging'), 0);
        });

        card.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            draggedCard = null;
            sourceZone = null;
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault(); 
            this.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });

        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');

            if (draggedCard && this !== sourceZone) {
                if (this.querySelector('.empty-slot')) {
                    this.innerHTML = ''; 
                    this.appendChild(draggedCard); 
                    sourceZone.innerHTML = '<div class="empty-slot" onclick="addCard(this)"></div>';
                } 
                else if (this.querySelector('.class-card')) {
                    const existingCard = this.querySelector('.class-card');
                    sourceZone.appendChild(existingCard); 
                    this.appendChild(draggedCard); 
                }
                saveData();
                showToast('تم نقل المادة بنجاح 🔄');
            }
        });
    });
}