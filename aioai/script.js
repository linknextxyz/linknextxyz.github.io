// 页面加载时从 localStorage 获取数据
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成，开始加载数据...');
    loadItems();
});

// 获取分类统计
function getCategoryStats(items) {
    const stats = {};
    items.forEach(item => {
        const category = item.category || '未分类';
        if (!stats[category]) {
            stats[category] = 1;
        } else {
            stats[category]++;
        }
    });
    return stats;
}

// 添加新项目
function addItem() {
    console.log('添加按钮被点击');
    
    const category = document.getElementById('categoryInput').value.trim();
    const title = document.getElementById('titleInput').value.trim();
    const url = document.getElementById('urlInput').value.trim();
    
    console.log('输入值:', { category, title, url });
    
    if (!title || !url) {
        alert('请填写标题和链接！');
        return;
    }

    try {
        // 获取现有数据
        let items = [];
        const storedItems = localStorage.getItem('items');
        
        if (storedItems) {
            items = JSON.parse(storedItems);
        }
        
        // 添加新项目
        const newItem = {
            id: Date.now(),
            category: category || '未分类',
            title,
            url
        };
        
        items.push(newItem);
        
        // 保存到 localStorage
        localStorage.setItem('items', JSON.stringify(items));
        
        // 刷新显示
        loadItems();
        
        // 清空输入框
        document.getElementById('categoryInput').value = '';
        document.getElementById('titleInput').value = '';
        document.getElementById('urlInput').value = '';
        
        console.log('数据添加成功');
    } catch (error) {
        console.error('添加数据时出错:', error);
        alert('添加数据时出错，请重试');
    }
}

// 删除项目
function deleteItem(id, title) {
    if (confirm(`确定要删除"${title}"吗？`)) {
        try {
            const items = JSON.parse(localStorage.getItem('items') || '[]');
            const newItems = items.filter(item => item.id !== id);
            localStorage.setItem('items', JSON.stringify(newItems));
            loadItems();
        } catch (error) {
            console.error('删除数据时出错:', error);
            alert('删除数据时出错，请重试');
        }
    }
}

// 加载并显示所有项目
function loadItems() {
    try {
        console.log('开始加载数据...');
        const previewArea = document.getElementById('previewArea');
        
        if (!previewArea) {
            console.error('找不到预览区域元素');
            return;
        }
        
        const storedItems = localStorage.getItem('items');
        const items = storedItems ? JSON.parse(storedItems) : [];
        
        if (items.length === 0) {
            previewArea.innerHTML = '<div class="no-items">暂无数据</div>';
            return;
        }

        // 标准化所有项目的分类
        items.forEach(item => {
            if (!item.category) {
                item.category = '未分类';
            }
        });

        // 获取分类统计
        const categoryStats = getCategoryStats(items);
        
        // 获取大分类（4个及以上的分类）
        const majorCategories = Object.entries(categoryStats)
            .filter(([_, count]) => count >= 4)
            .sort((a, b) => b[1] - a[1])
            .map(([category]) => category);

        let html = '';

        // 渲染大分类组及其项目
        majorCategories.forEach(category => {
            const categoryItems = items.filter(item => 
                (item.category || '未分类') === category
            );
            html += `
                <div class="category-section">
                    <div class="category-header">
                        <span class="category-count">${categoryStats[category]}</span>
                        <span class="category-title" 
                              contenteditable="true" 
                              onblur="updateCategoryName('${category}', this.textContent.trim())"
                              >${category}</span>
                    </div>
                    <div class="category-items">
                        ${categoryItems.map(item => `
                            <div class="preview-item">
                                <div class="item-content">
                                    <a href="${item.url}" target="_blank">${item.title}</a>
                                </div>
                                <button class="delete-btn" onclick="deleteItem(${item.id}, '${item.title.replace(/'/g, "\\'")}')">
                                    <span class="delete-icon">×</span>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        // 渲染其他项目（不属于大分类的项目）
        const otherItems = items.filter(item => 
            !majorCategories.includes(item.category || '未分类')
        );
        
        if (otherItems.length > 0) {
            html += `
                <div class="other-items-section">
                    <div class="other-items-header">
                        <span class="category-count">${otherItems.length}</span>
                        <span class="category-title" 
                              contenteditable="true" 
                              onblur="updateOtherLinksTitle(this.textContent.trim())"
                              >其他链接</span>
                    </div>
                    <div class="other-items-grid">
                        ${otherItems.map(item => `
                            <div class="preview-item">
                                <div class="item-content">
                                    <a href="${item.url}" target="_blank">${item.title}</a>
                                    <span class="category-tag">
                                        #${item.category || '未分类'}
                                    </span>
                                </div>
                                <button class="delete-btn" onclick="deleteItem(${item.id}, '${item.title.replace(/'/g, "\\'")}')">
                                    <span class="delete-icon">×</span>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        previewArea.innerHTML = html;
        console.log('数据加载完成');
    } catch (error) {
        console.error('加载数据时出错:', error);
        previewArea.innerHTML = '<div class="error">加载数据时出错，请刷新页面重试</div>';
    }
}

// 添加更新分类名称的函数
function updateCategoryName(oldCategory, newCategory) {
    if (!newCategory || oldCategory === newCategory) return;

    try {
        const items = JSON.parse(localStorage.getItem('items') || '[]');
        const updatedItems = items.map(item => {
            if (item.category === oldCategory) {
                return { ...item, category: newCategory };
            }
            return item;
        });

        localStorage.setItem('items', JSON.stringify(updatedItems));
        loadItems();
    } catch (error) {
        console.error('更新分类名称时出错:', error);
        alert('更新分类名称失败，请重试');
    }
}

// 添加新函数用于保存其他链接标题
function updateOtherLinksTitle(newTitle) {
    if (!newTitle) {
        loadItems(); // 如果标题为空，重新加载以恢复原标题
        return;
    }
    
    try {
        // 将新标题保存到 localStorage
        localStorage.setItem('otherLinksTitle', newTitle);
        // 不需要重新加载，因为这个标题不影响数据结构
    } catch (error) {
        console.error('更新其他链接标题时出错:', error);
        alert('更新标题失败，请重试');
        loadItems(); // 发生错误时重新加载以恢复原标题
    }
} 