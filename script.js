const tableBody = document.getElementById('tableBody');
const mainTitle = document.getElementById('mainTitle');
const themeSelect = document.getElementById('themeSelect');
const notesArea = document.getElementById('myNotes');
const colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

// نظام الإشعارات (Toast)
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

function highlightToday() {
    const today = new Date().getDay();
    if(today >= 1 && today <= 5) {
        document.getElementById('th-' + today).classList.add('today-col');
        const cells = document.querySelectorAll('.col-' + today);
        cells.forEach(cell => cell.classList.add('today-col'));
    }
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
    setupDragAndDrop(); // تفعيل السحب والإفلات
};

function saveTitle() { localStorage.setItem('proAppTitle', mainTitle.innerHTML); }
function saveData() { 
    localStorage.setItem('proAppTable', tableBody.innerHTML);
    setupDragAndDrop(); // إعادة ربط الأحداث بعد أي تعديل
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
    td.className = `${colClass} ${todayClass} drop-zone`;
    td.innerHTML = '<div class="empty-slot" onclick="addCard(this)"></div>';
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
    highlightToday();
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

// ---------------------------------------------------------
// ميزة السحب والإفلات (Drag and Drop)
// ---------------------------------------------------------
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
            e.preventDefault(); // ضروري للسماح بالإفلات
            this.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });

        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');

            if (draggedCard && this !== sourceZone) {
                // إذا تم الإفلات في مكان فارغ
                if (this.querySelector('.empty-slot')) {
                    this.innerHTML = ''; // مسح الفراغ
                    this.appendChild(draggedCard); // نقل البطاقة
                    // إعادة الفراغ للمكان القديم
                    sourceZone.innerHTML = '<div class="empty-slot" onclick="addCard(this)"></div>';
                } 
                // إذا تم الإفلات فوق مادة أخرى (تبديل المواقع)
                else if (this.querySelector('.class-card')) {
                    const existingCard = this.querySelector('.class-card');
                    sourceZone.appendChild(existingCard); // نقل القديم لمكان المسحوب
                    this.appendChild(draggedCard); // وضع المسحوب في المكان الجديد
                }
                saveData();
                showToast('تم نقل المادة بنجاح 🔄');
            }
        });
    });
}