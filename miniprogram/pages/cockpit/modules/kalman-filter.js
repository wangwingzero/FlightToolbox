/**
 * 航空级卡尔曼滤波器模块
 * 
 * 实现GPS/指南针/运动模型融合的扩展卡尔曼滤波器，专为航空导航应用优化
 * 
 * 功能特性：
 * - 10状态EKF：位置3D + 速度3D + 航向2D + 偏差2D
 * - GPS/指南针数据融合
 * - 自适应噪声调整
 * - 故障检测和恢复
 * - 高性能优化实现
 * 
 * 设计原则：
 * - 基于航空工业成熟理论（INS/GPS融合）
 * - 数值稳定性优先
 * - 实时性能保证
 * - 渐进集成兼容
 * 
 * 状态向量定义：
 * X = [lat, lon, alt, vn, ve, vd, heading, track, heading_bias, gps_bias]
 * 其中：
 * - lat, lon, alt: 位置（纬度、经度、高度）
 * - vn, ve, vd: 速度（北向、东向、垂直向下）
 * - heading: 真航向（指南针测量）
 * - track: 航迹角（GPS计算）
 * - heading_bias: 指南针偏差
 * - gps_bias: GPS位置偏差
 */

var KalmanFilter = {
  /**
   * 创建卡尔曼滤波器实例
   * @param {Object} config 配置参数
   * @returns {Object} 滤波器实例
   */
  create: function(config) {
    var filter = {
      // 配置参数
      config: config.kalman,
      
      // 状态向量 (10维)
      state: null,
      
      // 协方差矩阵 (10x10)
      covariance: null,
      
      // 运行状态
      isInitialized: false,
      isConverged: false,
      lastUpdateTime: 0,
      updateCount: 0,
      
      // 性能监控
      performanceStats: {
        avgComputeTime: 0,
        maxComputeTime: 0,
        totalUpdates: 0,
        failureCount: 0
      },
      
      // 故障检测
      faultDetection: {
        consecutiveFailures: 0,
        divergenceDetected: false,
        lastResetTime: 0
      },
      
      // 数值计算缓存
      matrixCache: {
        F: null,        // 状态转移矩阵
        H_gps: null,    // GPS观测矩阵
        H_compass: null, // 指南针观测矩阵
        Q: null,        // 过程噪声矩阵
        R_gps: null,    // GPS测量噪声矩阵
        R_compass: null // 指南针测量噪声矩阵
      },
      
      /**
       * 初始化滤波器
       * @param {Object} initialState 初始状态
       */
      init: function(initialState) {
        console.log('🔧 初始化航空级卡尔曼滤波器...');
        
        try {
          // 设置初始状态向量 [lat, lon, alt, vn, ve, vd, heading, track, heading_bias, gps_bias]
          filter.state = [
            initialState.latitude || filter.config.initialState.position[0],   // lat
            initialState.longitude || filter.config.initialState.position[1],  // lon
            initialState.altitude || 0,                                        // alt (meters)
            filter.config.initialState.velocity[0],                           // vn (m/s)
            filter.config.initialState.velocity[1],                           // ve (m/s)
            0,                                                                 // vd (m/s)
            initialState.heading || filter.config.initialState.heading,       // heading (deg)
            initialState.heading || filter.config.initialState.heading,       // track (deg)
            filter.config.initialState.headingBias,                          // heading_bias (deg)
            0                                                                  // gps_bias (m)
          ];
          
          // 初始化协方差矩阵 (10x10对角矩阵)
          filter.covariance = filter.createDiagonalMatrix(filter.config.initialCovariance);
          
          // 预计算固定矩阵
          filter.initializeMatrices();
          
          // 设置状态
          filter.isInitialized = true;
          filter.lastUpdateTime = Date.now();
          filter.updateCount = 0;
          
          console.log('✅ 卡尔曼滤波器初始化成功');
          console.log('初始状态:', {
            位置: [filter.state[0].toFixed(6), filter.state[1].toFixed(6), filter.state[2].toFixed(1) + 'm'],
            速度: [filter.state[3].toFixed(2), filter.state[4].toFixed(2), filter.state[5].toFixed(2)],
            航向: [filter.state[6].toFixed(1) + '°', filter.state[7].toFixed(1) + '°'],
            偏差: [filter.state[8].toFixed(2) + '°', filter.state[9].toFixed(2) + 'm']
          });
          
        } catch (error) {
          console.error('❌ 卡尔曼滤波器初始化失败:', error);
          filter.handleInitializationError(error);
        }
      },
      
      /**
       * 预测步骤 (时间更新)
       * @param {Number} deltaTime 时间间隔 (秒)
       */
      predict: function(deltaTime) {
        if (!filter.isInitialized || deltaTime <= 0) {
          return;
        }
        
        var startTime = Date.now();
        
        try {
          // 状态预测：X(k|k-1) = F * X(k-1|k-1)
          var predictedState = filter.predictState(filter.state, deltaTime);
          
          // 协方差预测：P(k|k-1) = F * P(k-1|k-1) * F' + Q
          var F = filter.getStateTransitionMatrix(deltaTime);
          var Q = filter.getProcessNoiseMatrix(deltaTime);
          
          // P_pred = F * P * F' + Q
          var FP = filter.multiplyMatrices(F, filter.covariance);
          var FPFT = filter.multiplyMatrices(FP, filter.transposeMatrix(F));
          var predictedCovariance = filter.addMatrices(FPFT, Q);
          
          // 更新状态
          filter.state = predictedState;
          filter.covariance = predictedCovariance;
          
          // 性能统计
          var computeTime = Date.now() - startTime;
          filter.updatePerformanceStats(computeTime);
          
          console.log('🔮 预测步骤完成, 耗时:', computeTime + 'ms');
          
        } catch (error) {
          console.error('❌ 预测步骤失败:', error);
          filter.handlePredictionError(error);
        }
      },
      
      /**
       * GPS测量更新
       * @param {Object} gpsData GPS测量数据
       * @param {Number} confidence 置信度 [0-1]
       */
      updateGPS: function(gpsData, confidence) {
        if (!filter.isInitialized) {
          console.warn('⚠️ 滤波器未初始化，跳过GPS更新');
          return;
        }
        
        var startTime = Date.now();
        
        try {
          // 构建GPS测量向量 [lat, lon, speed, track]
          var gpsMeasurement = [
            gpsData.latitude,
            gpsData.longitude,
            gpsData.speed * 0.514444,  // 节转m/s
            gpsData.heading || gpsData.track || 0
          ];
          
          // GPS观测方程：Z = H * X + v
          var H = filter.getGPSObservationMatrix();
          var predictedMeasurement = filter.multiplyMatrixVector(H, filter.state);
          
          // 计算新息 (innovation)
          var innovation = filter.calculateInnovation(gpsMeasurement, predictedMeasurement);
          
          // 新息门限检测
          if (!filter.validateInnovation(innovation, 'GPS')) {
            console.warn('⚠️ GPS新息异常，跳过更新');
            return;
          }
          
          // 自适应测量噪声（基于置信度）
          var R = filter.getAdaptiveGPSNoise(confidence);
          
          // 计算卡尔曼增益：K = P * H' * (H * P * H' + R)^(-1)
          var K = filter.calculateKalmanGain(H, R);
          
          // 状态更新：X = X + K * innovation
          var stateUpdate = filter.multiplyMatrixVector(K, innovation);
          filter.state = filter.addVectors(filter.state, stateUpdate);
          
          // 协方差更新：P = (I - K * H) * P
          var I = filter.createIdentityMatrix(10);
          var KH = filter.multiplyMatrices(K, H);
          var IKH = filter.subtractMatrices(I, KH);
          filter.covariance = filter.multiplyMatrices(IKH, filter.covariance);
          
          // 状态约束和标准化
          filter.normalizeState();
          
          // 更新时间戳
          filter.lastUpdateTime = Date.now();
          filter.updateCount++;
          
          // 收敛性检测
          filter.checkConvergence();
          
          var computeTime = Date.now() - startTime;
          filter.updatePerformanceStats(computeTime);
          
          console.log('📡 GPS更新完成, 置信度:', confidence.toFixed(3), '耗时:', computeTime + 'ms');
          
        } catch (error) {
          console.error('❌ GPS更新失败:', error);
          filter.handleUpdateError(error, 'GPS');
        }
      },
      
      /**
       * 指南针测量更新
       * @param {Number} compassHeading 指南针航向 (度)
       * @param {Number} confidence 置信度 [0-1]
       */
      updateCompass: function(compassHeading, confidence) {
        if (!filter.isInitialized) {
          console.warn('⚠️ 滤波器未初始化，跳过指南针更新');
          return;
        }
        
        var startTime = Date.now();
        
        try {
          // 指南针测量向量 [heading]
          var compassMeasurement = [compassHeading];
          
          // 指南针观测方程：Z = H * X + v
          var H = filter.getCompassObservationMatrix();
          var predictedMeasurement = filter.multiplyMatrixVector(H, filter.state);
          
          // 计算新息（处理角度循环）
          var innovation = filter.calculateAngularInnovation(compassMeasurement, predictedMeasurement);
          
          // 新息门限检测
          if (!filter.validateInnovation(innovation, 'compass')) {
            console.warn('⚠️ 指南针新息异常，跳过更新');
            return;
          }
          
          // 自适应测量噪声（基于置信度）
          var R = filter.getAdaptiveCompassNoise(confidence);
          
          // 计算卡尔曼增益
          var K = filter.calculateKalmanGain(H, R);
          
          // 状态更新
          var stateUpdate = filter.multiplyMatrixVector(K, innovation);
          filter.state = filter.addVectors(filter.state, stateUpdate);
          
          // 协方差更新
          var I = filter.createIdentityMatrix(10);
          var KH = filter.multiplyMatrices(K, H);
          var IKH = filter.subtractMatrices(I, KH);
          filter.covariance = filter.multiplyMatrices(IKH, filter.covariance);
          
          // 状态约束和标准化
          filter.normalizeState();
          
          // 更新时间戳
          filter.lastUpdateTime = Date.now();
          filter.updateCount++;
          
          var computeTime = Date.now() - startTime;
          filter.updatePerformanceStats(computeTime);
          
          console.log('🧭 指南针更新完成, 置信度:', confidence.toFixed(3), '耗时:', computeTime + 'ms');
          
        } catch (error) {
          console.error('❌ 指南针更新失败:', error);
          filter.handleUpdateError(error, 'compass');
        }
      },
      
      /**
       * 获取当前滤波状态（增强安全版）
       * @returns {Object} 当前状态信息
       */
      getState: function() {
        if (!filter.isInitialized) {
          console.warn('⚠️ 卡尔曼滤波器未初始化');
          return null;
        }
        
        // 验证状态向量存在且有效
        if (!filter.state || !Array.isArray(filter.state) || filter.state.length !== 10) {
          console.error('❌ 卡尔曼滤波器状态向量无效:', filter.state);
          return null;
        }
        
        // 验证协方差矩阵存在且有效
        if (!filter.covariance || !Array.isArray(filter.covariance) || filter.covariance.length !== 10) {
          console.error('❌ 卡尔曼滤波器协方差矩阵无效:', filter.covariance);
          return null;
        }
        
        // 验证状态向量中的所有元素都是数字
        for (var i = 0; i < filter.state.length; i++) {
          if (typeof filter.state[i] !== 'number' || isNaN(filter.state[i])) {
            console.error('❌ 状态向量元素无效: state[' + i + '] =', filter.state[i]);
            return null;
          }
        }
        
        // 安全地提取状态信息
        try {
          return {
            // 位置信息
            latitude: filter.state[0],
            longitude: filter.state[1],
            altitude: filter.state[2],
            
            // 速度信息 (转换为航空单位)
            velocityNorth: filter.state[3],     // m/s
            velocityEast: filter.state[4],      // m/s
            velocityDown: filter.state[5],      // m/s
            groundSpeed: Math.sqrt(filter.state[3] * filter.state[3] + filter.state[4] * filter.state[4]) * 1.944, // 节
            verticalSpeed: -filter.state[5] * 196.85, // 英尺/分钟 (向上为正)
            
            // 航向信息
            heading: filter.state[6],           // 度
            track: filter.state[7],             // 度
            
            // 偏差估计
            headingBias: filter.state[8],       // 度
            gpsBias: filter.state[9],           // 米
            
            // 不确定度信息
            positionUncertainty: Math.sqrt(filter.covariance[0][0] + filter.covariance[1][1]), // 米
            velocityUncertainty: Math.sqrt(filter.covariance[3][3] + filter.covariance[4][4]), // m/s
            headingUncertainty: Math.sqrt(filter.covariance[6][6]),                            // 度
            
            // 状态信息
            isConverged: filter.isConverged,
            updateCount: filter.updateCount,
            lastUpdateTime: filter.lastUpdateTime
          };
        } catch (error) {
          console.error('❌ 提取卡尔曼滤波器状态时出错:', error);
          return null;
        }
      },
      
      /**
       * 检查滤波器是否收敛
       * @returns {Boolean} 是否收敛
       */
      isConverged: function() {
        return filter.isConverged;
      },
      
      /**
       * 重置滤波器
       * @param {Object} newInitialState 新的初始状态
       */
      reset: function(newInitialState) {
        console.log('🔄 重置卡尔曼滤波器...');
        
        // 记录重置时间
        filter.faultDetection.lastResetTime = Date.now();
        filter.faultDetection.consecutiveFailures = 0;
        filter.faultDetection.divergenceDetected = false;
        
        // 重新初始化
        filter.isInitialized = false;
        filter.isConverged = false;
        filter.init(newInitialState || {});
      },
      
      /**
       * 获取性能统计信息
       * @returns {Object} 性能统计
       */
      getPerformanceStats: function() {
        return Object.assign({}, filter.performanceStats, {
          convergenceTime: filter.isConverged ? filter.updateCount : null,
          faultStatus: filter.faultDetection
        });
      },
      
      // ===================== 内部辅助方法 =====================
      
      /**
       * 预测状态向量
       * @param {Array} currentState 当前状态
       * @param {Number} dt 时间间隔
       * @returns {Array} 预测状态
       */
      predictState: function(currentState, dt) {
        var predicted = new Array(10);
        
        // 位置更新（基于速度积分）
        var R_earth = 6371000; // 地球半径
        predicted[0] = currentState[0] + (currentState[3] * dt) / R_earth * (180 / Math.PI); // lat
        predicted[1] = currentState[1] + (currentState[4] * dt) / (R_earth * Math.cos(currentState[0] * Math.PI / 180)) * (180 / Math.PI); // lon
        predicted[2] = currentState[2] - currentState[5] * dt; // alt (向下为正)
        
        // 速度更新（假设短时间内恒速）
        predicted[3] = currentState[3]; // vn
        predicted[4] = currentState[4]; // ve
        predicted[5] = currentState[5]; // vd
        
        // 航向更新（假设短时间内恒定）
        predicted[6] = currentState[6]; // heading
        predicted[7] = Math.atan2(predicted[4], predicted[3]) * 180 / Math.PI; // track (根据速度重新计算)
        if (predicted[7] < 0) predicted[7] += 360;
        
        // 偏差更新（随机游走模型）
        predicted[8] = currentState[8]; // heading_bias
        predicted[9] = currentState[9]; // gps_bias
        
        return predicted;
      },
      
      /**
       * 获取状态转移矩阵
       * @param {Number} dt 时间间隔
       * @returns {Array} F矩阵
       */
      getStateTransitionMatrix: function(dt) {
        // 创建10x10单位矩阵
        var F = filter.createIdentityMatrix(10);
        
        var R_earth = 6371000;
        var lat_rad = filter.state[0] * Math.PI / 180;
        
        // 位置对速度的偏导数
        F[0][3] = dt / R_earth * (180 / Math.PI);           // dlat/dvn
        F[1][4] = dt / (R_earth * Math.cos(lat_rad)) * (180 / Math.PI); // dlon/dve
        F[2][5] = -dt;                                      // dalt/dvd
        
        // 航迹对速度的偏导数
        var vn = filter.state[3];
        var ve = filter.state[4];
        var speed_sq = vn * vn + ve * ve;
        if (speed_sq > 0.01) { // 避免除零
          F[7][3] = -ve / speed_sq * (180 / Math.PI);       // dtrack/dvn
          F[7][4] = vn / speed_sq * (180 / Math.PI);        // dtrack/dve
        }
        
        return F;
      },
      
      /**
       * 获取过程噪声矩阵
       * @param {Number} dt 时间间隔
       * @returns {Array} Q矩阵
       */
      getProcessNoiseMatrix: function(dt) {
        var Q = filter.createZeroMatrix(10, 10);
        
        // 位置过程噪声
        Q[0][0] = filter.config.processNoise.positionVariance * dt;
        Q[1][1] = filter.config.processNoise.positionVariance * dt;
        Q[2][2] = filter.config.processNoise.altitudeVariance * dt;
        
        // 速度过程噪声
        Q[3][3] = filter.config.processNoise.velocityVariance * dt;
        Q[4][4] = filter.config.processNoise.velocityVariance * dt;
        Q[5][5] = filter.config.processNoise.velocityVariance * dt;
        
        // 航向过程噪声
        Q[6][6] = filter.config.processNoise.headingVariance * dt;
        Q[7][7] = filter.config.processNoise.headingVariance * dt;
        
        // 偏差过程噪声
        Q[8][8] = filter.config.processNoise.headingBiasVariance * dt;
        Q[9][9] = filter.config.processNoise.positionVariance * dt; // GPS偏差
        
        return Q;
      },
      
      /**
       * 获取GPS观测矩阵
       * @returns {Array} H_gps矩阵
       */
      getGPSObservationMatrix: function() {
        var H = filter.createZeroMatrix(4, 10);
        
        // GPS测量 [lat, lon, speed, track]
        H[0][0] = 1; // lat
        H[1][1] = 1; // lon
        
        // 速度大小测量
        var vn = filter.state[3];
        var ve = filter.state[4];
        var speed = Math.sqrt(vn * vn + ve * ve);
        if (speed > 0.01) {
          H[2][3] = vn / speed; // dspeed/dvn
          H[2][4] = ve / speed; // dspeed/dve
        }
        
        // 航迹角测量（同状态转移矩阵中的计算）
        var speed_sq = vn * vn + ve * ve;
        if (speed_sq > 0.01) {
          H[3][3] = -ve / speed_sq * (180 / Math.PI); // dtrack/dvn
          H[3][4] = vn / speed_sq * (180 / Math.PI);  // dtrack/dve
        }
        
        return H;
      },
      
      /**
       * 获取指南针观测矩阵
       * @returns {Array} H_compass矩阵
       */
      getCompassObservationMatrix: function() {
        var H = filter.createZeroMatrix(1, 10);
        
        // 指南针测量 [heading + bias]
        H[0][6] = 1; // heading
        H[0][8] = 1; // heading_bias
        
        return H;
      },
      
      /**
       * 计算卡尔曼增益
       * @param {Array} H 观测矩阵
       * @param {Array} R 测量噪声矩阵
       * @returns {Array} 卡尔曼增益矩阵
       */
      calculateKalmanGain: function(H, R) {
        // K = P * H' * (H * P * H' + R)^(-1)
        
        var PH = filter.multiplyMatrices(filter.covariance, filter.transposeMatrix(H));
        var HP = filter.multiplyMatrices(H, filter.covariance);
        var HPHT = filter.multiplyMatrices(HP, filter.transposeMatrix(H));
        var S = filter.addMatrices(HPHT, R); // 新息协方差
        
        var S_inv = filter.invertMatrix(S);
        var K = filter.multiplyMatrices(PH, S_inv);
        
        return K;
      },
      
      /**
       * 状态约束和标准化
       */
      normalizeState: function() {
        // 纬度约束 [-90, 90]
        filter.state[0] = Math.max(-90, Math.min(90, filter.state[0]));
        
        // 经度约束 [-180, 180]
        while (filter.state[1] > 180) filter.state[1] -= 360;
        while (filter.state[1] < -180) filter.state[1] += 360;
        
        // 航向角标准化 [0, 360)
        filter.state[6] = ((filter.state[6] % 360) + 360) % 360;
        filter.state[7] = ((filter.state[7] % 360) + 360) % 360;
        
        // 航向偏差约束 [-30, 30]
        filter.state[8] = Math.max(-30, Math.min(30, filter.state[8]));
        
        // GPS偏差约束 [-100, 100]
        filter.state[9] = Math.max(-100, Math.min(100, filter.state[9]));
      },
      
      /**
       * 检查收敛性
       */
      checkConvergence: function() {
        if (filter.isConverged) {
          return;
        }
        
        if (filter.updateCount < 10) {
          return; // 至少需要10次更新
        }
        
        // 检查位置不确定度
        var posUncertainty = Math.sqrt(filter.covariance[0][0] + filter.covariance[1][1]);
        var velUncertainty = Math.sqrt(filter.covariance[3][3] + filter.covariance[4][4]);
        var headUncertainty = Math.sqrt(filter.covariance[6][6]);
        
        if (posUncertainty < filter.config.adaptiveThresholds.convergenceThreshold &&
            velUncertainty < filter.config.adaptiveThresholds.convergenceThreshold &&
            headUncertainty < 5.0) { // 5度航向不确定度
          
          filter.isConverged = true;
          console.log('✅ 卡尔曼滤波器已收敛, 更新次数:', filter.updateCount);
        }
      },
      
      /**
       * 新息验证
       * @param {Array} innovation 新息向量
       * @param {String} sensorType 传感器类型
       * @returns {Boolean} 是否有效
       */
      validateInnovation: function(innovation, sensorType) {
        var threshold = filter.config.adaptiveThresholds.innovationGate;
        
        for (var i = 0; i < innovation.length; i++) {
          if (Math.abs(innovation[i]) > threshold) {
            console.warn('❌ ' + sensorType + '新息异常:', innovation[i], '阈值:', threshold);
            return false;
          }
        }
        
        return true;
      },
      
      /**
       * 计算新息（处理普通测量）
       * @param {Array} measurement 测量值
       * @param {Array} prediction 预测值
       * @returns {Array} 新息
       */
      calculateInnovation: function(measurement, prediction) {
        var innovation = new Array(measurement.length);
        for (var i = 0; i < measurement.length; i++) {
          innovation[i] = measurement[i] - prediction[i];
        }
        return innovation;
      },
      
      /**
       * 计算角度新息（处理角度循环）
       * @param {Array} measurement 测量值
       * @param {Array} prediction 预测值
       * @returns {Array} 角度新息
       */
      calculateAngularInnovation: function(measurement, prediction) {
        var innovation = new Array(measurement.length);
        for (var i = 0; i < measurement.length; i++) {
          var diff = measurement[i] - prediction[i];
          // 调整到[-180, 180]范围
          while (diff > 180) diff -= 360;
          while (diff < -180) diff += 360;
          innovation[i] = diff;
        }
        return innovation;
      },
      
      /**
       * 获取自适应GPS噪声矩阵
       * @param {Number} confidence 置信度
       * @returns {Array} R矩阵
       */
      getAdaptiveGPSNoise: function(confidence) {
        var basePosNoise = filter.config.measurementNoise.gpsPosition;
        var baseVelNoise = filter.config.measurementNoise.gpsVelocity;
        
        // 根据置信度调整噪声（置信度越低，噪声越大）
        var noiseFactor = 1.0 / Math.max(0.1, confidence);
        
        var R = filter.createZeroMatrix(4, 4);
        R[0][0] = basePosNoise * noiseFactor;      // lat
        R[1][1] = basePosNoise * noiseFactor;      // lon
        R[2][2] = baseVelNoise * noiseFactor;      // speed
        R[3][3] = 25 * noiseFactor;                // track (度^2)
        
        return R;
      },
      
      /**
       * 获取自适应指南针噪声矩阵
       * @param {Number} confidence 置信度
       * @returns {Array} R矩阵
       */
      getAdaptiveCompassNoise: function(confidence) {
        var baseNoise = filter.config.measurementNoise.compassHeading;
        var noiseFactor = 1.0 / Math.max(0.1, confidence);
        
        var R = filter.createZeroMatrix(1, 1);
        R[0][0] = baseNoise * noiseFactor;
        
        return R;
      },
      
      /**
       * 更新性能统计
       * @param {Number} computeTime 计算时间
       */
      updatePerformanceStats: function(computeTime) {
        var stats = filter.performanceStats;
        
        stats.totalUpdates++;
        stats.maxComputeTime = Math.max(stats.maxComputeTime, computeTime);
        stats.avgComputeTime = (stats.avgComputeTime * (stats.totalUpdates - 1) + computeTime) / stats.totalUpdates;
        
        // 性能警告
        if (computeTime > filter.config.performance.maxComputeTime) {
          console.warn('⚠️ 卡尔曼滤波器计算耗时过长:', computeTime + 'ms');
        }
      },
      
      /**
       * 处理初始化错误
       * @param {Error} error 错误对象
       */
      handleInitializationError: function(error) {
        filter.faultDetection.consecutiveFailures++;
        filter.isInitialized = false;
        
        console.error('卡尔曼滤波器初始化失败，将禁用滤波功能');
      },
      
      /**
       * 处理预测错误
       * @param {Error} error 错误对象
       */
      handlePredictionError: function(error) {
        filter.faultDetection.consecutiveFailures++;
        
        if (filter.faultDetection.consecutiveFailures > filter.config.fault.maxConsecutiveFailures) {
          console.warn('⚠️ 预测步骤连续失败，重置滤波器');
          filter.reset();
        }
      },
      
      /**
       * 处理更新错误
       * @param {Error} error 错误对象
       * @param {String} sensorType 传感器类型
       */
      handleUpdateError: function(error, sensorType) {
        filter.faultDetection.consecutiveFailures++;
        filter.performanceStats.failureCount++;
        
        console.warn('⚠️ ' + sensorType + '更新失败:', error.message);
        
        if (filter.faultDetection.consecutiveFailures > filter.config.fault.maxConsecutiveFailures) {
          if (filter.config.fault.resetOnFailure) {
            console.warn('⚠️ 更新连续失败，重置滤波器');
            filter.reset();
          }
        }
      },
      
      // ===================== 矩阵运算工具函数 =====================
      
      /**
       * 创建零矩阵
       * @param {Number} rows 行数
       * @param {Number} cols 列数
       * @returns {Array} 零矩阵
       */
      createZeroMatrix: function(rows, cols) {
        var matrix = new Array(rows);
        for (var i = 0; i < rows; i++) {
          matrix[i] = new Array(cols).fill(0);
        }
        return matrix;
      },
      
      /**
       * 创建单位矩阵
       * @param {Number} size 矩阵大小
       * @returns {Array} 单位矩阵
       */
      createIdentityMatrix: function(size) {
        var matrix = filter.createZeroMatrix(size, size);
        for (var i = 0; i < size; i++) {
          matrix[i][i] = 1;
        }
        return matrix;
      },
      
      /**
       * 创建对角矩阵
       * @param {Array} diagonal 对角元素
       * @returns {Array} 对角矩阵
       */
      createDiagonalMatrix: function(diagonal) {
        var size = diagonal.length;
        var matrix = filter.createZeroMatrix(size, size);
        for (var i = 0; i < size; i++) {
          matrix[i][i] = diagonal[i];
        }
        return matrix;
      },
      
      /**
       * 矩阵乘法（增强安全版）
       * @param {Array} A 矩阵A
       * @param {Array} B 矩阵B
       * @returns {Array} A*B
       */
      multiplyMatrices: function(A, B) {
        // 参数验证
        if (!A || !B || !Array.isArray(A) || !Array.isArray(B)) {
          throw new Error('矩阵乘法参数无效: A或B不是有效数组');
        }
        
        if (A.length === 0 || B.length === 0) {
          throw new Error('矩阵乘法参数无效: A或B为空数组');
        }
        
        if (!Array.isArray(A[0]) || !Array.isArray(B[0])) {
          throw new Error('矩阵乘法参数无效: A或B不是二维数组');
        }
        
        var rowsA = A.length;
        var colsA = A[0].length;
        var colsB = B[0].length;
        
        // 维度验证
        if (colsA !== B.length) {
          throw new Error('矩阵乘法维度不匹配: A的列数(' + colsA + ') != B的行数(' + B.length + ')');
        }
        
        var result = new Array(rowsA);
        for (var i = 0; i < rowsA; i++) {
          result[i] = new Array(colsB);
          for (var j = 0; j < colsB; j++) {
            var sum = 0;
            for (var k = 0; k < colsA; k++) {
              // 验证元素是否为数字
              if (typeof A[i][k] !== 'number' || typeof B[k][j] !== 'number') {
                throw new Error('矩阵元素不是数字: A[' + i + '][' + k + ']=' + A[i][k] + ', B[' + k + '][' + j + ']=' + B[k][j]);
              }
              sum += A[i][k] * B[k][j];
            }
            result[i][j] = sum;
          }
        }
        return result;
      },
      
      /**
       * 矩阵向量乘法
       * @param {Array} matrix 矩阵
       * @param {Array} vector 向量
       * @returns {Array} 结果向量
       */
      multiplyMatrixVector: function(matrix, vector) {
        var rows = matrix.length;
        var result = new Array(rows);
        
        for (var i = 0; i < rows; i++) {
          var sum = 0;
          for (var j = 0; j < vector.length; j++) {
            sum += matrix[i][j] * vector[j];
          }
          result[i] = sum;
        }
        return result;
      },
      
      /**
       * 矩阵转置
       * @param {Array} matrix 矩阵
       * @returns {Array} 转置矩阵
       */
      transposeMatrix: function(matrix) {
        var rows = matrix.length;
        var cols = matrix[0].length;
        var result = new Array(cols);
        
        for (var i = 0; i < cols; i++) {
          result[i] = new Array(rows);
          for (var j = 0; j < rows; j++) {
            result[i][j] = matrix[j][i];
          }
        }
        return result;
      },
      
      /**
       * 矩阵加法
       * @param {Array} A 矩阵A
       * @param {Array} B 矩阵B
       * @returns {Array} A+B
       */
      addMatrices: function(A, B) {
        var rows = A.length;
        var cols = A[0].length;
        var result = new Array(rows);
        
        for (var i = 0; i < rows; i++) {
          result[i] = new Array(cols);
          for (var j = 0; j < cols; j++) {
            result[i][j] = A[i][j] + B[i][j];
          }
        }
        return result;
      },
      
      /**
       * 矩阵减法
       * @param {Array} A 矩阵A
       * @param {Array} B 矩阵B
       * @returns {Array} A-B
       */
      subtractMatrices: function(A, B) {
        var rows = A.length;
        var cols = A[0].length;
        var result = new Array(rows);
        
        for (var i = 0; i < rows; i++) {
          result[i] = new Array(cols);
          for (var j = 0; j < cols; j++) {
            result[i][j] = A[i][j] - B[i][j];
          }
        }
        return result;
      },
      
      /**
       * 向量加法
       * @param {Array} a 向量a
       * @param {Array} b 向量b
       * @returns {Array} a+b
       */
      addVectors: function(a, b) {
        var result = new Array(a.length);
        for (var i = 0; i < a.length; i++) {
          result[i] = a[i] + b[i];
        }
        return result;
      },
      
      /**
       * 矩阵求逆（高斯-约旦消元法）
       * @param {Array} matrix 矩阵
       * @returns {Array} 逆矩阵
       */
      invertMatrix: function(matrix) {
        var n = matrix.length;
        var identity = filter.createIdentityMatrix(n);
        
        // 创建增广矩阵 [A|I]
        var augmented = new Array(n);
        for (var i = 0; i < n; i++) {
          augmented[i] = matrix[i].concat(identity[i]);
        }
        
        // 高斯-约旦消元
        for (var i = 0; i < n; i++) {
          // 寻找主元
          var maxRow = i;
          for (var k = i + 1; k < n; k++) {
            if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
              maxRow = k;
            }
          }
          
          // 交换行
          if (maxRow !== i) {
            var temp = augmented[i];
            augmented[i] = augmented[maxRow];
            augmented[maxRow] = temp;
          }
          
          // 检查奇异性
          if (Math.abs(augmented[i][i]) < 1e-10) {
            console.warn('⚠️ 矩阵接近奇异，使用正则化');
            augmented[i][i] = 1e-6; // 正则化
          }
          
          // 规范化当前行
          var pivot = augmented[i][i];
          for (var j = 0; j < 2 * n; j++) {
            augmented[i][j] /= pivot;
          }
          
          // 消元
          for (var k = 0; k < n; k++) {
            if (k !== i) {
              var factor = augmented[k][i];
              for (var j = 0; j < 2 * n; j++) {
                augmented[k][j] -= factor * augmented[i][j];
              }
            }
          }
        }
        
        // 提取逆矩阵
        var inverse = new Array(n);
        for (var i = 0; i < n; i++) {
          inverse[i] = augmented[i].slice(n);
        }
        
        return inverse;
      },
      
      /**
       * 初始化预计算矩阵
       */
      initializeMatrices: function() {
        // 预计算固定的观测矩阵
        filter.matrixCache.H_gps = filter.getGPSObservationMatrix();
        filter.matrixCache.H_compass = filter.getCompassObservationMatrix();
        
        console.log('✅ 矩阵缓存初始化完成');
      },
      
      /**
       * 销毁滤波器
       */
      destroy: function() {
        console.log('🧹 销毁卡尔曼滤波器...');
        
        // 清理状态
        filter.isInitialized = false;
        filter.isConverged = false;
        filter.state = null;
        filter.covariance = null;
        
        // 清理缓存
        filter.matrixCache = {
          F: null,
          H_gps: null,
          H_compass: null,
          Q: null,
          R_gps: null,
          R_compass: null
        };
        
        console.log('✅ 卡尔曼滤波器已销毁');
      }
    };
    
    return filter;
  }
};

module.exports = KalmanFilter;