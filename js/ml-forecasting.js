
document.addEventListener('DOMContentLoaded', () => {
    const generateDataButton = document.getElementById('generateDataButton');
    const historicalDataTableBody = document.getElementById('historicalDataTableBody');
    const predictionsTableBody = document.getElementById('predictionsTableBody');
    const errorMetricsTableBody = document.getElementById('errorMetricsTableBody');
    const forecastChartCanvas = document.getElementById('forecastChart');
    let forecastChart;

    // Function to generate synthetic historical data
    function generateHistoricalData(numYears = Math.floor(Math.random() * 4) + 5) { // 5-8 years
        const currentYear = new Date().getFullYear();
        const data = [];
        let baseValue = Math.random() * 100 + 50; // Random base value

        for (let i = 0; i < numYears; i++) {
            const year = currentYear - numYears + 1 + i;
            // Add some trend and seasonality/noise
            const value = baseValue + (i * 5) + (Math.sin(i * Math.PI / 2) * 10) + (Math.random() * 20 - 10);
            data.push({ year: year, value: parseFloat(value.toFixed(2)) });
        }
        return data;
    }

    // Simple Linear Regression
    function linearRegression(data) {
        const n = data.length;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;

        data.forEach(point => {
            sumX += point.year;
            sumY += point.value;
            sumXY += point.year * point.value;
            sumXX += point.year * point.year;
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const predict = (year) => slope * year + intercept;
        return { predict: predict, slope: slope, intercept: intercept };
    }

    // Moving Averages (MA)
    function movingAverage(data, windowSize) {
        if (data.length < windowSize) {
            // If not enough data for the window, return the last value as a simple prediction
            return data[data.length - 1].value;
        }
        const recentData = data.slice(-windowSize);
        const sum = recentData.reduce((acc, curr) => acc + curr.value, 0);
        return sum / windowSize;
    }

    // Single Exponential Smoothing (SES)
    function exponentialSmoothing(data, alpha) {
        if (data.length === 0) {
            return 0;
        }
        let smoothedValue = data[0].value; // Initialize with the first value
        for (let i = 1; i < data.length; i++) {
            smoothedValue = alpha * data[i].value + (1 - alpha) * smoothedValue;
        }
        return smoothedValue;
    }

    // Polynomial Regression (Degree 2 - Quadratic)
    // This is a simplified implementation for demonstration purposes.
    // A more robust solution would involve matrix operations (e.g., Gaussian elimination)
    // to solve for coefficients, which is complex to implement from scratch.
    function polynomialRegression(data) {
        const n = data.length;
        if (n < 3) { // Need at least 3 points for quadratic regression
            return { predict: (year) => data[data.length - 1].value }; // Fallback to last value
        }

        // For a quadratic equation y = ax^2 + bx + c, we need to solve a system of linear equations.
        // This simplified version will use a heuristic based on linear regression and curvature.
        // This is NOT a rigorous polynomial regression solver.

        const lr = linearRegression(data);
        const slope = lr.slope;
        const intercept = lr.intercept;

        // Estimate 'a' (curvature) based on the difference from linear trend
        let sumDiff = 0;
        data.forEach(point => {
            const linearPredicted = slope * point.year + intercept;
            sumDiff += (point.value - linearPredicted);
        });
        const a_poly = sumDiff / (n * n); // Very rough approximation for 'a'

        // Adjust 'b' and 'c' based on 'a' and the linear regression
        const b_poly = slope; // Keep linear slope as base for 'b'
        const c_poly = intercept; // Keep linear intercept as base for 'c'

        const predict = (year) => a_poly * year * year + b_poly * year + c_poly;
        return { predict: predict };
    }

    // Placeholder for Random Forest (requires a library)
    // For simplicity, we'll use a basic average or a slightly more complex heuristic
    function randomForestPredict(data, nextYear) {
        // In a real scenario, you'd use a library like 'ml-regression-forest'
        // For this demo, let's do a weighted average of recent data
        if (data.length < 3) {
            return data[data.length - 1].value; // Fallback for very small data
        }
        const lastThree = data.slice(-3);
        return (lastThree[0].value * 0.2 + lastThree[1].value * 0.3 + lastThree[2].value * 0.5) * (1 + Math.random() * 0.05 - 0.025); // Add some noise
    }

    // Placeholder for ARIMA (requires a complex library or backend)
    function arimaPredict(data, nextYear) {
        // ARIMA is very complex for client-side JS.
        // For this demo, let's use a simple moving average as a stand-in.
        if (data.length < 3) {
            return data[data.length - 1].value; // Fallback for very small data
        }
        const lastThree = data.slice(-3);
        const avg = (lastThree[0].value + lastThree[1].value + lastThree[2].value) / 3;
        return avg * (1 + Math.random() * 0.03 - 0.015); // Add some noise
    }

    // Function to calculate Mean Absolute Error (MAE)
    function calculateMAE(predictions, actuals) {
        if (predictions.length !== actuals.length) {
            throw new Error("Prediction and actuals arrays must have the same length.");
        }
        let sumAbsoluteError = 0;
        for (let i = 0; i < predictions.length; i++) {
            sumAbsoluteError += Math.abs(predictions[i] - actuals[i]);
        }
        return sumAbsoluteError / predictions.length;
    }

    // Function to calculate Root Mean Squared Error (RMSE)
    function calculateRMSE(predictions, actuals) {
        if (predictions.length !== actuals.length) {
            throw new Error("Prediction and actuals arrays must have the same length.");
        }
        let sumSquaredError = 0;
        for (let i = 0; i < predictions.length; i++) {
            sumSquaredError += Math.pow(predictions[i] - actuals[i], 2);
        }
        return Math.sqrt(sumSquaredError / predictions.length);
    }

    // Function to run models and update UI
    function runForecasting() {
        const historicalData = generateHistoricalData();
        const years = historicalData.map(d => d.year);
        const values = historicalData.map(d => d.value);
        const nextYear = Math.max(...years) + 1;

        // Clear previous data
        historicalDataTableBody.innerHTML = '';
        predictionsTableBody.innerHTML = '';
        errorMetricsTableBody.innerHTML = '';

        // Populate historical data table
        historicalData.forEach(d => {
            const row = historicalDataTableBody.insertRow();
            row.insertCell().textContent = d.year;
            row.insertCell().textContent = d.value;
        });

        // --- Run Models and Predict ---
        const models = {};
        const predictions = {};
        const errorMetrics = {};

        // Linear Regression
        const lrModel = linearRegression(historicalData);
        const lrPrediction = lrModel.predict(nextYear);
        models['Linear Regression'] = lrModel;
        predictions['Linear Regression'] = parseFloat(lrPrediction.toFixed(2));

        // Moving Averages
        const maPrediction = movingAverage(historicalData, 3); // Using a window size of 3
        predictions['Moving Averages'] = parseFloat(maPrediction.toFixed(2));

        // Exponential Smoothing
        const esPrediction = exponentialSmoothing(historicalData, 0.7); // Using alpha of 0.7
        predictions['Exponential Smoothing'] = parseFloat(esPrediction.toFixed(2));

        // Polynomial Regression
        const polyModel = polynomialRegression(historicalData);
        const polyPrediction = polyModel.predict(nextYear);
        models['Polynomial Regression'] = polyModel;
        predictions['Polynomial Regression'] = parseFloat(polyPrediction.toFixed(2));

        // Random Forest (using placeholder)
        const rfPrediction = randomForestPredict(historicalData, nextYear);
        predictions['Random Forest'] = parseFloat(rfPrediction.toFixed(2));

        // ARIMA (using placeholder)
        const arimaPrediction = arimaPredict(historicalData, nextYear);
        predictions['ARIMA'] = parseFloat(arimaPrediction.toFixed(2));

        // Populate predictions table
        for (const modelName in predictions) {
            const row = predictionsTableBody.insertRow();
            row.insertCell().textContent = modelName;
            row.insertCell().textContent = predictions[modelName];
        }

        // --- Calculate Error Metrics (using historical data for "training error") ---
        // For a true "test error", you'd split data into train/test sets.
        // For this demo, we'll calculate how well each model "fits" the historical data.
        const lrHistoricalPredictions = historicalData.map(d => lrModel.predict(d.year));
        const polyHistoricalPredictions = historicalData.map(d => polyModel.predict(d.year));

        // For RF and ARIMA placeholders, we can't easily get historical predictions for error calculation
        // without more complex implementations. For now, we'll just show predictions.
        // In a real app, you'd train these models and get their in-sample predictions.
        errorMetrics['Random Forest'] = { mae: 'N/A', rmse: 'N/A' };
        errorMetrics['ARIMA'] = { mae: 'N/A', rmse: 'N/A' };


        // Populate error metrics table
        for (const modelName in errorMetrics) {
            const row = errorMetricsTableBody.insertRow();
            row.insertCell().textContent = modelName;
            row.insertCell().textContent = errorMetrics[modelName].mae;
            row.insertCell().textContent = errorMetrics[modelName].rmse;
        }

        // --- Chart Visualization ---
        if (forecastChart) {
            forecastChart.destroy(); // Destroy existing chart before creating a new one
        }

        forecastChart = new Chart(forecastChartCanvas, {
            type: 'line',
            data: {
                labels: [...years, nextYear],
                datasets: [
                    {
                        label: 'Historical Data',
                        data: values,
                        borderColor: '#6497b1', // Muted Medium Blue
                        backgroundColor: 'rgba(100, 151, 177, 0.2)',
                        tension: 0.1,
                        pointRadius: 5,
                        pointBackgroundColor: '#6497b1'
                    },
                    {
                        label: 'Linear Regression Forecast',
                        data: [...Array(years.length - 1).fill(null), values[values.length - 1], predictions['Linear Regression']],
                        borderColor: '#FFD700', // Gold
                        borderDash: [5, 5],
                        tension: 0.1,
                        pointRadius: 5,
                        pointBackgroundColor: '#FFD700'
                    },
                    {
                        label: 'Moving Averages Forecast',
                        data: [...Array(years.length - 1).fill(null), values[values.length - 1], predictions['Moving Averages']],
                        borderColor: '#1E90FF', // Dodger Blue
                        borderDash: [5, 5],
                        tension: 0.1,
                        pointRadius: 5,
                        pointBackgroundColor: '#1E90FF'
                    },
                    {
                        label: 'Exponential Smoothing Forecast',
                        data: [...Array(years.length - 1).fill(null), values[values.length - 1], predictions['Exponential Smoothing']],
                        borderColor: '#DA70D6', // Orchid
                        borderDash: [5, 5],
                        tension: 0.1,
                        pointRadius: 5,
                        pointBackgroundColor: '#DA70D6'
                    },
                    {
                        label: 'Polynomial Regression Forecast',
                        data: [...Array(years.length - 1).fill(null), values[values.length - 1], predictions['Polynomial Regression']],
                        borderColor: '#ADFF2F', // GreenYellow
                        borderDash: [5, 5],
                        tension: 0.1,
                        pointRadius: 5,
                        pointBackgroundColor: '#ADFF2F'
                    },
                    {
                        label: 'Random Forest Forecast',
                        data: [...Array(years.length - 1).fill(null), values[values.length - 1], predictions['Random Forest']],
                        borderColor: '#32CD32', // Lime Green
                        borderDash: [5, 5],
                        tension: 0.1,
                        pointRadius: 5,
                        pointBackgroundColor: '#32CD32'
                    },
                    {
                        label: 'ARIMA Forecast',
                        data: [...Array(years.length - 1).fill(null), values[values.length - 1], predictions['ARIMA']],
                        borderColor: '#FF6347', // Tomato
                        borderDash: [5, 5],
                        tension: 0.1,
                        pointRadius: 5,
                        pointBackgroundColor: '#FF6347'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Year',
                            color: '#e0e0e0'
                        },
                        ticks: {
                            color: '#e0e0e0',
                            callback: function(value) {
                                return Math.round(value);
                            }
                        },
                        grid: {
                            color: 'rgba(224, 224, 224, 0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Value',
                            color: '#e0e0e0'
                        },
                        ticks: {
                            color: '#e0e0e0'
                        },
                        grid: {
                            color: 'rgba(224, 224, 224, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e0e0e0'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return 'Year: ' + Math.round(context[0].parsed.x);
                            },
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }

    // Event listener for the generate data button
    generateDataButton.addEventListener('click', runForecasting);

    // Initial run when the modal is opened
    // Using Bootstrap's modal events to ensure chart renders correctly
    const mlForecastingModal = document.getElementById('mlForecastingModal');
    mlForecastingModal.addEventListener('shown.bs.modal', runForecasting);
});
