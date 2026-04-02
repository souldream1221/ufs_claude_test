/**
 * UFS Test Program - Core Testing Logic
 * Simulates UFS device testing with realistic data
 */

class UFSTester {
    constructor() {
        this.isTesting = false;
        this.shouldStop = false;
        this.testResults = [];
        this.deviceInfo = null;
        this.selectedModel = null;

        // Reference standards for UFS devices
        this.standards = {
            seqRead: { min: 800, max: 4200 },     // MB/s
            seqWrite: { min: 150, max: 2500 },    // MB/s
            randReadIOPS: { min: 50000, max: 600000 },
            randWriteIOPS: { min: 10000, max: 150000 },
            temperature: { min: 0, max: 85 },     // Celsius
            healthPercent: { min: 80, max: 100 }
        };

        // UFS Device Database
        this.deviceDatabase = {
            'samsung-128': {
                manufacturer: 'Samsung',
                model: 'KLUDG4U1EA-B0C1',
                capacity: '128GB',
                ufsVersion: 'UFS 2.1',
                lunCount: 8,
                seqRead: { min: 800, max: 1200 },
                seqWrite: { min: 400, max: 600 },
                randReadIOPS: { min: 120000, max: 180000 },
                randWriteIOPS: { min: 35000, max: 50000 },
                features: ['WriteBooster', 'HPB', 'FFU', 'Extended UFS']
            },
            'samsung-256': {
                manufacturer: 'Samsung',
                model: 'KLUDG8U1EA-B0C1',
                capacity: '256GB',
                ufsVersion: 'UFS 3.1',
                lunCount: 8,
                seqRead: { min: 1800, max: 2500 },
                seqWrite: { min: 800, max: 1200 },
                randReadIOPS: { min: 250000, max: 350000 },
                randWriteIOPS: { min: 60000, max: 90000 },
                features: ['WriteBooster', 'HPB', 'FFU', 'Extended UFS', 'Inline Encryption']
            },
            'skhynix-128': {
                manufacturer: 'SK Hynix',
                model: 'H9HQ15AECMBDAR',
                capacity: '128GB',
                ufsVersion: 'UFS 2.1',
                lunCount: 6,
                seqRead: { min: 700, max: 1000 },
                seqWrite: { min: 350, max: 550 },
                randReadIOPS: { min: 100000, max: 150000 },
                randWriteIOPS: { min: 30000, max: 45000 },
                features: ['WriteBooster', 'HPB', 'FFU']
            },
            'skhynix-256': {
                manufacturer: 'SK Hynix',
                model: 'H9HQ53AECMMDAR',
                capacity: '256GB',
                ufsVersion: 'UFS 3.1',
                lunCount: 8,
                seqRead: { min: 1600, max: 2200 },
                seqWrite: { min: 700, max: 1100 },
                randReadIOPS: { min: 220000, max: 320000 },
                randWriteIOPS: { min: 55000, max: 85000 },
                features: ['WriteBooster', 'HPB', 'FFU', 'Extended UFS']
            },
            'micron-128': {
                manufacturer: 'Micron',
                model: 'MT128GAXATCJ-AAT',
                capacity: '128GB',
                ufsVersion: 'UFS 2.1',
                lunCount: 6,
                seqRead: { min: 750, max: 1100 },
                seqWrite: { min: 380, max: 580 },
                randReadIOPS: { min: 110000, max: 160000 },
                randWriteIOPS: { min: 32000, max: 48000 },
                features: ['WriteBooster', 'FFU', 'Extended UFS']
            },
            'micron-256': {
                manufacturer: 'Micron',
                model: 'MT256GAXATCJ-AAT',
                capacity: '256GB',
                ufsVersion: 'UFS 3.1',
                lunCount: 8,
                seqRead: { min: 1700, max: 2400 },
                seqWrite: { min: 750, max: 1150 },
                randReadIOPS: { min: 230000, max: 340000 },
                randWriteIOPS: { min: 58000, max: 88000 },
                features: ['WriteBooster', 'HPB', 'FFU', 'Extended UFS', 'Inline Encryption']
            },
            'toshiba-128': {
                manufacturer: 'Toshiba',
                model: 'THGJFAT1T84BAIL',
                capacity: '128GB',
                ufsVersion: 'UFS 2.0',
                lunCount: 6,
                seqRead: { min: 650, max: 950 },
                seqWrite: { min: 300, max: 500 },
                randReadIOPS: { min: 90000, max: 140000 },
                randWriteIOPS: { min: 28000, max: 42000 },
                features: ['FFU', 'Extended UFS']
            },
            'wd-128': {
                manufacturer: 'Western Digital',
                model: 'SDINFDK4-128G',
                capacity: '128GB',
                ufsVersion: 'UFS 2.1',
                lunCount: 6,
                seqRead: { min: 700, max: 1050 },
                seqWrite: { min: 320, max: 520 },
                randReadIOPS: { min: 95000, max: 145000 },
                randWriteIOPS: { min: 29000, max: 44000 },
                features: ['WriteBooster', 'HPB', 'FFU']
            }
        };
    }

    /**
     * Set the selected device model
     */
    setSelectedModel(modelId) {
        this.selectedModel = modelId;
    }

    /**
     * Get device info from database
     */
    getDeviceSpec(modelId) {
        if (!modelId || modelId === 'random') {
            const keys = Object.keys(this.deviceDatabase);
            modelId = keys[Math.floor(Math.random() * keys.length)];
        }
        return this.deviceDatabase[modelId];
    }

    /**
     * Get simulated UFS device information
     */
    async getDeviceInfo() {
        await this.delay(500);

        const spec = this.getDeviceSpec(this.selectedModel);

        this.deviceInfo = {
            manufacturer: spec.manufacturer,
            model: spec.model,
            firmwareVersion: `V${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 99)}.${Math.floor(Math.random() * 999)}`,
            serialNumber: this.generateSerialNumber(),
            capacity: spec.capacity,
            ufsVersion: spec.ufsVersion,
            lunCount: spec.lunCount,
            bootEnabled: true,
            rpmbSize: 4 * 1024 * 1024, // 4MB
            supportedFeatures: spec.features,
            spec: spec // Store spec for test methods to use
        };

        return this.deviceInfo;
    }

    /**
     * Run all selected tests
     */
    async runTests(selectedCategories, onProgress, onLog) {
        if (this.isTesting) {
            throw new Error('测试正在进行中');
        }

        this.isTesting = true;
        this.shouldStop = false;
        this.testResults = [];

        const startTime = Date.now();

        try {
            onLog('开始UFS设备测试...', 'info');

            // Get device info first
            onLog('读取设备信息...', 'info');
            await this.getDeviceInfo();
            onLog(`检测到设备: ${this.deviceInfo.model}`, 'info');

            let totalTests = 0;
            let completedTests = 0;

            // Calculate total tests
            if (selectedCategories.basic) totalTests += 1;
            if (selectedCategories.performance) totalTests += 4;
            if (selectedCategories.features) totalTests += 5;
            if (selectedCategories.stress) totalTests += 2;

            // Run tests based on selected categories
            if (selectedCategories.basic) {
                if (this.shouldStop) return;
                onProgress(completedTests / totalTests * 100, '基础信息测试');
                const result = await this.testBasicInfo(onLog);
                this.testResults.push(result);
                completedTests++;
            }

            if (selectedCategories.performance) {
                const perfTests = [
                    { name: '顺序读取速度', fn: this.testSequentialRead },
                    { name: '顺序写入速度', fn: this.testSequentialWrite },
                    { name: '随机读取IOPS', fn: this.testRandomReadIOPS },
                    { name: '随机写入IOPS', fn: this.testRandomWriteIOPS }
                ];

                for (const test of perfTests) {
                    if (this.shouldStop) return;
                    onProgress(completedTests / totalTests * 100, test.name);
                    const result = await test.fn.call(this, onLog);
                    this.testResults.push(result);
                    completedTests++;
                }
            }

            if (selectedCategories.features) {
                const featureTests = [
                    { name: 'Boot分区状态', fn: this.testBootPartition },
                    { name: 'RPMB功能', fn: this.testRPMB },
                    { name: '扩展属性', fn: this.testExtendedAttributes },
                    { name: '电源管理', fn: this.testPowerManagement },
                    { name: '健康状态', fn: this.testHealthStatus }
                ];

                for (const test of featureTests) {
                    if (this.shouldStop) return;
                    onProgress(completedTests / totalTests * 100, test.name);
                    const result = await test.fn.call(this, onLog);
                    this.testResults.push(result);
                    completedTests++;
                }
            }

            if (selectedCategories.stress) {
                const stressTests = [
                    { name: '读写稳定性', fn: this.testStability },
                    { name: '温度监控', fn: this.testTemperature }
                ];

                for (const test of stressTests) {
                    if (this.shouldStop) return;
                    onProgress(completedTests / totalTests * 100, test.name);
                    const result = await test.fn.call(this, onLog);
                    this.testResults.push(result);
                    completedTests++;
                }
            }

            onProgress(100, '测试完成');
            onLog(`测试完成！耗时: ${((Date.now() - startTime) / 1000).toFixed(1)}秒`, 'info');

            return {
                deviceInfo: this.deviceInfo,
                results: this.testResults,
                duration: (Date.now() - startTime) / 1000,
                summary: this.calculateSummary()
            };

        } finally {
            this.isTesting = false;
        }
    }

    /**
     * Stop current testing
     */
    stopTest() {
        this.shouldStop = true;
    }

    /**
     * Test basic device information
     */
    async testBasicInfo(onLog) {
        await this.delay(300);
        onLog('基础信息验证通过', 'info');

        return {
            name: '基础信息',
            category: 'basic',
            status: 'pass',
            value: '设备识别正常',
            reference: '-',
            details: this.deviceInfo
        };
    }

    /**
     * Test sequential read speed
     */
    async testSequentialRead(onLog) {
        onLog('正在测试顺序读取速度...', 'info');
        await this.delay(2000);

        const spec = this.deviceInfo.spec;
        const speed = this.randomRange(spec.seqRead.min, spec.seqRead.max);
        const status = speed >= this.standards.seqRead.min ? 'pass' : 'fail';

        onLog(`顺序读取速度: ${speed.toFixed(0)} MB/s`, status === 'pass' ? 'info' : 'warning');

        return {
            name: '顺序读取速度',
            category: 'performance',
            status: status,
            value: `${speed.toFixed(0)} MB/s`,
            reference: `${spec.seqRead.min}-${spec.seqRead.max} MB/s`,
            details: { speed }
        };
    }

    /**
     * Test sequential write speed
     */
    async testSequentialWrite(onLog) {
        onLog('正在测试顺序写入速度...', 'info');
        await this.delay(2000);

        const spec = this.deviceInfo.spec;
        const speed = this.randomRange(spec.seqWrite.min, spec.seqWrite.max);
        const status = speed >= this.standards.seqWrite.min ? 'pass' : 'fail';

        onLog(`顺序写入速度: ${speed.toFixed(0)} MB/s`, status === 'pass' ? 'info' : 'warning');

        return {
            name: '顺序写入速度',
            category: 'performance',
            status: status,
            value: `${speed.toFixed(0)} MB/s`,
            reference: `${spec.seqWrite.min}-${spec.seqWrite.max} MB/s`,
            details: { speed }
        };
    }

    /**
     * Test random read IOPS
     */
    async testRandomReadIOPS(onLog) {
        onLog('正在测试随机读取IOPS...', 'info');
        await this.delay(1500);

        const spec = this.deviceInfo.spec;
        const iops = this.randomRange(spec.randReadIOPS.min, spec.randReadIOPS.max);
        const status = iops >= this.standards.randReadIOPS.min ? 'pass' : 'fail';

        onLog(`随机读取IOPS: ${iops.toFixed(0)}`, status === 'pass' ? 'info' : 'warning');

        return {
            name: '随机读取IOPS',
            category: 'performance',
            status: status,
            value: `${iops.toFixed(0)} IOPS`,
            reference: `${spec.randReadIOPS.min.toLocaleString()}-${spec.randReadIOPS.max.toLocaleString()} IOPS`,
            details: { iops }
        };
    }

    /**
     * Test random write IOPS
     */
    async testRandomWriteIOPS(onLog) {
        onLog('正在测试随机写入IOPS...', 'info');
        await this.delay(1500);

        const spec = this.deviceInfo.spec;
        const iops = this.randomRange(spec.randWriteIOPS.min, spec.randWriteIOPS.max);
        const status = iops >= this.standards.randWriteIOPS.min ? 'pass' : 'fail';

        onLog(`随机写入IOPS: ${iops.toFixed(0)}`, status === 'pass' ? 'info' : 'warning');

        return {
            name: '随机写入IOPS',
            category: 'performance',
            status: status,
            value: `${iops.toFixed(0)} IOPS`,
            reference: `${spec.randWriteIOPS.min.toLocaleString()}-${spec.randWriteIOPS.max.toLocaleString()} IOPS`,
            details: { iops }
        };
    }

    /**
     * Test boot partition
     */
    async testBootPartition(onLog) {
        onLog('检查Boot分区状态...', 'info');
        await this.delay(800);

        const bootLunA = Math.random() > 0.1;
        const bootLunB = Math.random() > 0.1;
        const status = bootLunA && bootLunB ? 'pass' : 'fail';

        onLog(`Boot分区 A: ${bootLunA ? '正常' : '异常'}`, bootLunA ? 'info' : 'error');
        onLog(`Boot分区 B: ${bootLunB ? '正常' : '异常'}`, bootLunB ? 'info' : 'error');

        return {
            name: 'Boot分区状态',
            category: 'features',
            status: status,
            value: bootLunA && bootLunB ? '正常' : '异常',
            reference: '双分区正常',
            details: { bootLunA, bootLunB }
        };
    }

    /**
     * Test RPMB (Replay Protected Memory Block)
     */
    async testRPMB(onLog) {
        onLog('测试RPMB功能...', 'info');
        await this.delay(1000);

        const rpmbAvailable = true;
        const rpmbSize = 4 * 1024 * 1024; // 4MB
        const writeCounter = Math.floor(Math.random() * 10000);

        onLog(`RPMB大小: ${(rpmbSize / 1024 / 1024).toFixed(0)}MB`, 'info');
        onLog(`写入计数器: ${writeCounter}`, 'info');

        return {
            name: 'RPMB功能',
            category: 'features',
            status: 'pass',
            value: '功能正常',
            reference: '可用',
            details: { rpmbSize, writeCounter }
        };
    }

    /**
     * Test extended attributes
     */
    async testExtendedAttributes(onLog) {
        onLog('读取扩展属性...', 'info');
        await this.delay(600);

        const attributes = [
            { name: 'bMaxLU', value: 8 },
            { name: 'bSecureRemovalType', value: 1 },
            { name: 'bSupportQLC', value: Math.random() > 0.5 },
            { name: 'bSupportWriteBooster', value: true }
        ];

        onLog('扩展属性读取完成', 'info');

        return {
            name: '扩展属性',
            category: 'features',
            status: 'pass',
            value: '支持',
            reference: 'UFS 2.1+',
            details: { attributes }
        };
    }

    /**
     * Test power management
     */
    async testPowerManagement(onLog) {
        onLog('检查电源管理状态...', 'info');
        await this.delay(800);

        const powerModes = ['ACTIVE', 'IDLE', 'POWER_SAVE', 'SLEEP'];
        const currentMode = powerModes[Math.floor(Math.random() * powerModes.length)];
        const voltage = 3.3;

        onLog(`当前电源模式: ${currentMode}`, 'info');
        onLog(`工作电压: ${voltage}V`, 'info');

        return {
            name: '电源管理',
            category: 'features',
            status: 'pass',
            value: currentMode,
            reference: 'ACTIVE/IDLE/PS/SLEEP',
            details: { currentMode, voltage }
        };
    }

    /**
     * Test health status
     */
    async testHealthStatus(onLog) {
        onLog('检查设备健康状态...', 'info');
        await this.delay(1000);

        const healthPercent = Math.floor(this.randomRange(85, 100));
        const badBlocks = Math.floor(this.randomRange(0, 50));
        const wearLevel = Math.floor(this.randomRange(1, 20));
        const status = healthPercent >= 80 ? 'pass' : 'warning';

        onLog(`健康度: ${healthPercent}%`, healthPercent >= 80 ? 'info' : 'warning');
        onLog(`坏块数: ${badBlocks}`, badBlocks < 100 ? 'info' : 'warning');
        onLog(`磨损度: ${wearLevel}%`, wearLevel < 50 ? 'info' : 'warning');

        return {
            name: '健康状态',
            category: 'features',
            status: status,
            value: `${healthPercent}%`,
            reference: '≥80%',
            details: { healthPercent, badBlocks, wearLevel }
        };
    }

    /**
     * Test stability (stress test)
     */
    async testStability(onLog) {
        onLog('开始稳定性测试 (3秒)...', 'info');

        const iterations = 3;
        for (let i = 0; i < iterations; i++) {
            if (this.shouldStop) return;
            await this.delay(1000);
            onLog(`稳定性测试进度: ${((i + 1) / iterations * 100).toFixed(0)}%`, 'info');
        }

        const errors = Math.random() > 0.95 ? 1 : 0;
        const status = errors === 0 ? 'pass' : 'fail';

        onLog(`稳定性测试完成，错误数: ${errors}`, status === 'pass' ? 'info' : 'error');

        return {
            name: '读写稳定性',
            category: 'stress',
            status: status,
            value: errors === 0 ? '通过' : '失败',
            reference: '0错误',
            details: { errors, iterations }
        };
    }

    /**
     * Test temperature monitoring
     */
    async testTemperature(onLog) {
        onLog('监控设备温度...', 'info');

        const readings = [];
        for (let i = 0; i < 3; i++) {
            if (this.shouldStop) return;
            await this.delay(500);
            const temp = this.randomRange(35, 55);
            readings.push(temp);
            onLog(`温度读数 #${i + 1}: ${temp.toFixed(1)}°C`, temp < 70 ? 'info' : 'warning');
        }

        const avgTemp = readings.reduce((a, b) => a + b, 0) / readings.length;
        const maxTemp = Math.max(...readings);
        const status = maxTemp < this.standards.temperature.max ? 'pass' : 'fail';

        return {
            name: '温度监控',
            category: 'stress',
            status: status,
            value: `${avgTemp.toFixed(1)}°C (最高: ${maxTemp.toFixed(1)}°C)`,
            reference: `<${this.standards.temperature.max}°C`,
            details: { readings, avgTemp, maxTemp }
        };
    }

    /**
     * Calculate test summary
     */
    calculateSummary() {
        const total = this.testResults.length;
        const pass = this.testResults.filter(r => r.status === 'pass').length;
        const fail = this.testResults.filter(r => r.status === 'fail').length;
        const skip = this.testResults.filter(r => r.status === 'skip').length;

        return { total, pass, fail, skip };
    }

    /**
     * Retest a single test
     */
    async retest(testName, onLog) {
        const testMap = {
            '基础信息': this.testBasicInfo,
            '顺序读取速度': this.testSequentialRead,
            '顺序写入速度': this.testSequentialWrite,
            '随机读取IOPS': this.testRandomReadIOPS,
            '随机写入IOPS': this.testRandomWriteIOPS,
            'Boot分区状态': this.testBootPartition,
            'RPMB功能': this.testRPMB,
            '扩展属性': this.testExtendedAttributes,
            '电源管理': this.testPowerManagement,
            '健康状态': this.testHealthStatus,
            '读写稳定性': this.testStability,
            '温度监控': this.testTemperature
        };

        const testFn = testMap[testName];
        if (!testFn) {
            throw new Error(`未知测试项目: ${testName}`);
        }

        onLog(`重新测试: ${testName}...`, 'info');
        const result = await testFn.call(this, onLog);

        // Update result in array
        const index = this.testResults.findIndex(r => r.name === testName);
        if (index >= 0) {
            this.testResults[index] = result;
        }

        return result;
    }

    /* Helper Methods */

    generateSerialNumber() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let serial = '';
        for (let i = 0; i < 12; i++) {
            serial += chars[Math.floor(Math.random() * chars.length)];
        }
        return serial;
    }

    getRandomCapacity() {
        const capacities = [64, 128, 256, 512, 1024];
        const capacity = capacities[Math.floor(Math.random() * capacities.length)];
        return capacity >= 1024 ? '1TB' : `${capacity}GB`;
    }

    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UFSTester;
}
