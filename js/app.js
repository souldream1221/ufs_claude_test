/**
 * UFS Test Program - Main Application
 * Entry point that orchestrates the testing flow
 */

class UFSApp {
    constructor() {
        this.tester = new UFSTester();
        this.ui = new UIController();
        this.isTesting = false;

        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.bindEvents();
        this.ui.addLog('UFS测试程序已启动', 'info');
        this.ui.addLog('请连接UFS设备或开始模拟测试', 'info');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Model selection
        const modelSelect = document.getElementById('modelSelect');
        modelSelect.addEventListener('change', (e) => {
            this.selectModel(e.target.value);
        });

        // Start test button
        document.getElementById('btnStart').addEventListener('click', () => {
            this.startTest();
        });

        // Stop test button
        document.getElementById('btnStop').addEventListener('click', () => {
            this.stopTest();
        });

        // Clear results button
        document.getElementById('btnClear').addEventListener('click', () => {
            this.clearResults();
        });

        // Check at least one category is selected
        document.querySelectorAll('[data-category]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.validateSelection());
        });
    }

    /**
     * Handle model selection
     */
    selectModel(modelId) {
        if (!modelId) {
            this.ui.showModelInfo(false);
            this.validateSelection();
            return;
        }

        this.tester.setSelectedModel(modelId);
        const spec = this.tester.getDeviceSpec(modelId);

        this.ui.showModelInfo(true, {
            manufacturer: spec.manufacturer,
            capacity: spec.capacity,
            ufsVersion: spec.ufsVersion
        });

        this.ui.addLog(`已选择设备型号: ${spec.manufacturer} ${spec.model}`, 'info');
        this.validateSelection();
    }

    /**
     * Validate that at least one test category and model is selected
     */
    validateSelection() {
        const modelSelect = document.getElementById('modelSelect');
        const hasModel = modelSelect && modelSelect.value !== '';
        const categories = this.ui.getSelectedCategories();
        const hasCategory = Object.values(categories).some(v => v);
        document.getElementById('btnStart').disabled = !hasModel || !hasCategory || this.isTesting;
    }

    /**
     * Start the test sequence
     */
    async startTest() {
        const categories = this.ui.getSelectedCategories();
        const modelSelect = document.getElementById('modelSelect');

        if (!modelSelect || !modelSelect.value) {
            this.ui.addLog('错误：请先选择测试型号', 'error');
            return;
        }

        if (!Object.values(categories).some(v => v)) {
            this.ui.addLog('错误：请至少选择一个测试类别', 'error');
            return;
        }

        this.isTesting = true;
        this.ui.setTestingState(true);
        this.ui.showProgress(true);
        this.ui.clearAll();

        try {
            const result = await this.tester.runTests(
                categories,
                (percent, testName) => this.ui.updateProgress(percent, testName),
                (message, type) => this.ui.addLog(message, type)
            );

            if (result) {
                this.ui.updateDeviceStatus(true);
                this.ui.displayDeviceInfo(result.deviceInfo);
                this.ui.displayResults(result.results);
                this.ui.displayPerformanceCharts(result.results);
                this.ui.updateOverview(result.summary, result.duration);
            }
        } catch (error) {
            this.ui.addLog(`测试出错: ${error.message}`, 'error');
            console.error(error);
        } finally {
            this.isTesting = false;
            this.ui.setTestingState(false);
            this.ui.updateProgress(100, '就绪');
        }
    }

    /**
     * Stop the current test
     */
    stopTest() {
        this.tester.stopTest();
        this.ui.addLog('正在停止测试...', 'warning');
        this.isTesting = false;
        this.ui.setTestingState(false);
    }

    /**
     * Clear all results
     */
    clearResults() {
        this.ui.clearAll();
        this.ui.addLog('已清除所有结果', 'info');
    }

    /**
     * Retest a single test item
     */
    async retest(testName) {
        if (this.isTesting) {
            this.ui.addLog('请等待当前测试完成', 'warning');
            return;
        }

        this.isTesting = true;
        this.ui.setTestingState(true);

        try {
            const result = await this.tester.retest(
                testName,
                (message, type) => this.ui.addLog(message, type)
            );

            this.ui.addResultToTable(result);
            this.ui.updateOverview(this.tester.calculateSummary(), 0);

            // Update performance charts if needed
            if (result.category === 'performance') {
                this.ui.displayPerformanceCharts(this.tester.testResults);
            }

            this.ui.addLog(`${testName} 重测完成: ${result.status === 'pass' ? '通过' : '失败'}`,
                result.status === 'pass' ? 'info' : 'warning');
        } catch (error) {
            this.ui.addLog(`重测失败: ${error.message}`, 'error');
        } finally {
            this.isTesting = false;
            this.ui.setTestingState(false);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new UFSApp();
});
