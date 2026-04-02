/**
 * UFS Test Program - UI Controller
 * Handles all UI updates and interactions
 */

class UIController {
    constructor() {
        this.elements = {
            // Header
            deviceStatus: document.getElementById('deviceStatus'),

            // Model selector
            modelInfo: document.getElementById('modelInfo'),
            infoManufacturer: document.getElementById('infoManufacturer'),
            infoCapacity: document.getElementById('infoCapacity'),
            infoVersion: document.getElementById('infoVersion'),

            // Progress
            progressSection: document.getElementById('progressSection'),
            progressPercent: document.getElementById('progressPercent'),
            progressFill: document.getElementById('progressFill'),
            currentTest: document.getElementById('currentTest'),

            // Overview cards
            overviewCards: document.getElementById('overviewCards'),
            passCount: document.getElementById('passCount'),
            failCount: document.getElementById('failCount'),
            skipCount: document.getElementById('skipCount'),
            testTime: document.getElementById('testTime'),

            // Device info
            deviceInfoPanel: document.getElementById('deviceInfoPanel'),
            deviceInfoGrid: document.getElementById('deviceInfoGrid'),

            // Performance
            performancePanel: document.getElementById('performancePanel'),

            // Results
            resultsBody: document.getElementById('resultsBody'),

            // Log
            logContainer: document.getElementById('logContainer'),

            // Buttons
            btnStart: document.getElementById('btnStart'),
            btnStop: document.getElementById('btnStop'),
            btnClear: document.getElementById('btnClear')
        };

        this.charts = {};
    }

    /**
     * Show/hide model info panel
     */
    showModelInfo(show, info = null) {
        this.elements.modelInfo.style.display = show ? 'block' : 'none';
        if (info && show) {
            this.elements.infoManufacturer.textContent = info.manufacturer;
            this.elements.infoCapacity.textContent = info.capacity;
            this.elements.infoVersion.textContent = info.ufsVersion;
        }
    }

    /**
     * Update device status indicator
     */
    updateDeviceStatus(connected) {
        const indicator = this.elements.deviceStatus.querySelector('.status-indicator');
        const text = this.elements.deviceStatus.querySelector('.status-text');

        if (connected) {
            indicator.classList.remove('offline');
            indicator.classList.add('online');
            text.textContent = '已连接';
        } else {
            indicator.classList.remove('online');
            indicator.classList.add('offline');
            text.textContent = '未连接';
        }
    }

    /**
     * Update progress bar
     */
    updateProgress(percent, currentTestName) {
        this.elements.progressPercent.textContent = `${Math.round(percent)}%`;
        this.elements.progressFill.style.width = `${percent}%`;
        if (currentTestName) {
            this.elements.currentTest.textContent = currentTestName;
        }
    }

    /**
     * Show/hide progress section
     */
    showProgress(show) {
        this.elements.progressSection.style.display = show ? 'block' : 'none';
    }

    /**
     * Update overview cards
     */
    updateOverview(summary, duration) {
        this.elements.passCount.textContent = summary.pass;
        this.elements.failCount.textContent = summary.fail;
        this.elements.skipCount.textContent = summary.skip;
        this.elements.testTime.textContent = `${duration.toFixed(1)}s`;
        this.elements.overviewCards.style.display = 'grid';
    }

    /**
     * Display device information
     */
    displayDeviceInfo(deviceInfo) {
        const fields = [
            { label: '制造商', key: 'manufacturer' },
            { label: '型号', key: 'model' },
            { label: '固件版本', key: 'firmwareVersion' },
            { label: '序列号', key: 'serialNumber' },
            { label: '容量', key: 'capacity' },
            { label: 'UFS版本', key: 'ufsVersion' },
            { label: 'LUN数量', key: 'lunCount' },
            { label: 'RPMB大小', key: 'rpmbSize', format: v => `${(v / 1024 / 1024).toFixed(0)} MB` }
        ];

        this.elements.deviceInfoGrid.innerHTML = fields.map(field => {
            const value = field.format ? field.format(deviceInfo[field.key]) : deviceInfo[field.key];
            return `
                <div class="info-item">
                    <span class="info-label">${field.label}</span>
                    <span class="info-value">${value}</span>
                </div>
            `;
        }).join('');

        this.elements.deviceInfoPanel.style.display = 'block';
    }

    /**
     * Display performance charts
     */
    displayPerformanceCharts(results) {
        const perfResults = results.filter(r => r.category === 'performance');
        if (perfResults.length === 0) return;

        this.elements.performancePanel.style.display = 'block';

        // Speed chart data
        const speedTests = perfResults.filter(r => r.name.includes('速度'));
        if (speedTests.length > 0) {
            this.createOrUpdateChart('speedChart', {
                type: 'bar',
                data: {
                    labels: speedTests.map(t => t.name.replace('速度', '')),
                    datasets: [{
                        label: '速度 (MB/s)',
                        data: speedTests.map(t => t.details.speed),
                        backgroundColor: ['#00d9ff', '#e94560'],
                        borderColor: ['#00d9ff', '#e94560'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: '读写速度对比',
                            color: '#eaeaea'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: '#2a2a4a' },
                            ticks: { color: '#a0a0a0' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#a0a0a0' }
                        }
                    }
                }
            });
        }

        // IOPS chart data
        const iopsTests = perfResults.filter(r => r.name.includes('IOPS'));
        if (iopsTests.length > 0) {
            this.createOrUpdateChart('iopsChart', {
                type: 'bar',
                data: {
                    labels: iopsTests.map(t => t.name.replace('IOPS', '').trim()),
                    datasets: [{
                        label: 'IOPS',
                        data: iopsTests.map(t => t.details.iops),
                        backgroundColor: ['#00d9ff', '#e94560'],
                        borderColor: ['#00d9ff', '#e94560'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: 'IOPS性能对比',
                            color: '#eaeaea'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: '#2a2a4a' },
                            ticks: { color: '#a0a0a0' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#a0a0a0' }
                        }
                    }
                }
            });
        }
    }

    /**
     * Create or update a chart
     */
    createOrUpdateChart(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // Destroy existing chart if any
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(canvas, config);
    }

    /**
     * Display test results in table
     */
    displayResults(results) {
        if (results.length === 0) return;

        const tbody = this.elements.resultsBody;
        tbody.innerHTML = results.map(result => `
            <tr>
                <td>${result.name}</td>
                <td>${this.getCategoryName(result.category)}</td>
                <td>${this.getStatusBadge(result.status)}</td>
                <td>${result.value}</td>
                <td>${result.reference}</td>
                <td>
                    <button class="btn-retest" onclick="app.retest('${result.name}')">
                        重测
                    </button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Add a single result to table
     */
    addResultToTable(result) {
        const tbody = this.elements.resultsBody;

        // Remove empty row if exists
        const emptyRow = tbody.querySelector('.empty-row');
        if (emptyRow) {
            emptyRow.remove();
        }

        // Check if result already exists
        const existingRow = tbody.querySelector(`tr[data-test-name="${result.name}"]`);
        const rowHtml = `
            <tr data-test-name="${result.name}">
                <td>${result.name}</td>
                <td>${this.getCategoryName(result.category)}</td>
                <td>${this.getStatusBadge(result.status)}</td>
                <td>${result.value}</td>
                <td>${result.reference}</td>
                <td>
                    <button class="btn-retest" onclick="app.retest('${result.name}')">
                        重测
                    </button>
                </td>
            </tr>
        `;

        if (existingRow) {
            existingRow.outerHTML = rowHtml;
        } else {
            tbody.insertAdjacentHTML('beforeend', rowHtml);
        }
    }

    /**
     * Get category display name
     */
    getCategoryName(category) {
        const names = {
            basic: '基础信息',
            performance: '性能测试',
            features: '高级Feature',
            stress: '压力测试'
        };
        return names[category] || category;
    }

    /**
     * Get status badge HTML
     */
    getStatusBadge(status) {
        const labels = {
            pass: '通过',
            fail: '失败',
            skip: '跳过',
            warning: '警告'
        };
        return `<span class="status-badge ${status}">${labels[status] || status}</span>`;
    }

    /**
     * Add log entry
     */
    addLog(message, type = 'info') {
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-message">${message}</span>
        `;

        this.elements.logContainer.appendChild(entry);
        this.scrollToBottom();
    }

    /**
     * Scroll log container to bottom
     */
    scrollToBottom() {
        this.elements.logContainer.scrollTop = this.elements.logContainer.scrollHeight;
    }

    /**
     * Clear all results and logs
     */
    clearAll() {
        this.elements.resultsBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="6">暂无测试结果，请选择测试项目并点击"开始测试"</td>
            </tr>
        `;

        this.elements.logContainer.innerHTML = `
            <div class="log-entry info">
                <span class="log-time">${new Date().toLocaleTimeString()}</span>
                <span class="log-message">等待测试开始...</span>
            </div>
        `;

        this.elements.overviewCards.style.display = 'none';
        this.elements.deviceInfoPanel.style.display = 'none';
        this.elements.performancePanel.style.display = 'none';
        this.elements.progressSection.style.display = 'none';
        // Don't hide modelInfo on clear - keep the selection

        // Clear charts
        Object.values(this.charts).forEach(chart => chart.destroy());
        this.charts = {};

        this.updateDeviceStatus(false);
    }

    /**
     * Set button states during testing
     */
    setTestingState(isTesting) {
        this.elements.btnStart.disabled = isTesting;
        this.elements.btnStop.disabled = !isTesting;
        this.elements.btnClear.disabled = isTesting;
    }

    /**
     * Get selected test categories
     */
    getSelectedCategories() {
        return {
            basic: document.querySelector('[data-category="basic"]').checked,
            performance: document.querySelector('[data-category="performance"]').checked,
            features: document.querySelector('[data-category="features"]').checked,
            stress: document.querySelector('[data-category="stress"]').checked
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
