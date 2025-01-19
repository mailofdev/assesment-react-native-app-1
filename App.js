import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Dimensions,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  ScrollView,
  Pressable,
  SafeAreaView,
  Alert,
  useWindowDimensions,
  Platform,
  RefreshControl,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const RadioButton = ({ label, selected, onPress }) => (
  <Pressable 
    style={({ pressed }) => [
      styles.radioWrapper,
      pressed && styles.radioWrapperPressed
    ]} 
    onPress={onPress}
  >
    <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>
    <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>{label}</Text>
  </Pressable>
);

const SimpleLineChart = ({ chartData, width }) => {
  const chartWidth = Math.max(width - 32, 300);
  const chartHeight = Math.min(220, width * 0.5);

  if (!chartData.labels.length || !chartData.scores.length) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const formatLabel = (label) => {
     return label.length > 10 ? `${label.substring(0, 3)}..` : label;
  };

  return (
    <View style={styles.chartContainer}>
      <LineChart
        data={{
          labels: chartData.labels.map(formatLabel),
          datasets: [{
            data: chartData.scores.map(score => 
              isFinite(score) ? score : 0
            ),
          }],
        }}
        width={chartWidth}
        height={chartHeight}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(59, 89, 152, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#3b5998",
          },
          propsForLabels: {
            // fontSize: width < 375 ? 8 : 10,
            // rotation: 15,     
          }, 
          horizontalOffset: 0,
          formatXLabel: (label) => formatLabel(label), 
        }}
        fromZero={true}
        segments={4} 
        bezier
        style={[
          styles.chart,
          { paddingBottom: 20 }  
        ]}
      />
    </View>
  );
};

const App = () => {
  const { width, height } = useWindowDimensions();
  const [dataSource, setDataSource] = useState("Test");
  const [data, setData] = useState([]);
  const [countryInput, setCountryInput] = useState("");
  const [average, setAverage] = useState("N/A");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState({ labels: [], scores: [] });

  const testData = [
    ["Pakistan", 23],
    ["Pakistan", 127],
    ["India", 3],
    ["India", 71],
    ["Australia", 31],
    ["India", 22],
    ["Pakistan", 81],
    ["Pakistan", 81],
  ];

  const fetchServerData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://assessments.reliscore.com/api/cric-scores/"
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert(
        "Error",
        "Failed to fetch data from server. Please try again later.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (dataSource === "Server") {
      await fetchServerData();
    }
    setRefreshing(false);
  }, [dataSource, fetchServerData]);

  useEffect(() => {
    if (dataSource === "Server") {
      fetchServerData();
    } else {
      setData(testData);
    }
  }, [dataSource, fetchServerData]);

  useEffect(() => {
    calculateChartData();
  }, [data]);

  const calculateAverage = useCallback((country) => {
    if (!country) {
      setAverage("N/A");
      return;
    }
  
    const filteredScores = data.filter(([name]) =>
      name.toLowerCase() === country.toLowerCase()
    );
    
    if (filteredScores.length === 0) {
      setAverage("N/A");
    } else {
      const total = filteredScores.reduce((sum, [, score]) => sum + score, 0);
      const avg = total / filteredScores.length;
      setAverage(avg.toFixed(2));
    }
  }, [data]);

  const calculateChartData = useCallback(() => {
    const countryScores = {};
    
    // Validate input data
    if (!Array.isArray(data) || data.length === 0) {
      setChartData({ labels: [], scores: [] });
      return;
    }
  
    // Process valid scores only
    data.forEach(([country, score]) => {
      if (country && typeof score === 'number' && !isNaN(score) && isFinite(score)) {
        if (!countryScores[country]) {
          countryScores[country] = [];
        }
        countryScores[country].push(score);
      }
    });
  
    const labels = Object.keys(countryScores);
    const scores = labels.map(country => {
      const validScores = countryScores[country];
      if (validScores.length === 0) return 0;
      return validScores.reduce((sum, val) => sum + val, 0) / validScores.length;
    });
  
    const validScores = scores.every(score => isFinite(score) && !isNaN(score));
    if (!validScores) {
      setChartData({ labels: [], scores: [] });
      return;
    }
  
    setChartData({ labels, scores });
  }, [data]);

  const handleInputChange = useCallback((text) => {
    setCountryInput(text);
    calculateAverage(text);
  }, [calculateAverage]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Cricket Score Analyzer</Text>

        <View style={styles.radioGroup}>
          <RadioButton
            label="Test data"
            selected={dataSource === "Test"}
            onPress={() => setDataSource("Test")}
          />
          <RadioButton
            label="Server data"
            selected={dataSource === "Server"}
            onPress={() => setDataSource("Server")}
          />
        </View>

        {loading ? (
          <ActivityIndicator 
            style={styles.loader} 
            size="large" 
            color="#3b5998" 
          />
        ) : (
          <View style={styles.content}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Search country:</Text>
              <TextInput
                style={[styles.input, { width: width - 32 }]}
                value={countryInput}
                onChangeText={handleInputChange}
                placeholder="eg: India, Pakistan, Australia"
                placeholderTextColor="#666"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            {average !== "N/A" && (
              <View style={styles.averageContainer}>
                <Text style={styles.averageLabel}>
                  Average Score: <Text style={styles.averageValue}>{average}</Text>
                </Text>
                <View
                  style={[
                    styles.bar,
                    { width: Math.min((width * parseFloat(average)) / 300, width - 32) },
                  ]}
                />
              </View>
            )}

            <Text style={styles.chartTitle}>Average Scores by Country</Text>
            <SimpleLineChart chartData={chartData} width={width} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#3b5998",
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "Roboto",
      },
    }),
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    gap: 24,
  },
  radioWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  radioWrapperPressed: {
    opacity: 0.7,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3b5998",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: "#3b5998",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3b5998",
  },
  radioLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  radioLabelSelected: {
    color: "#3b5998",
  },
  content: {
    flex: 1,
    alignItems: "stretch",
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  averageContainer: {
    marginBottom: 24,
  },
  averageLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  averageValue: {
    fontWeight: "bold",
    color: "#3b5998",
  },
  bar: {
    height: 12,
    backgroundColor: "#3b5998",
    borderRadius: 6,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loader: {
    marginVertical: 32,
  },
  noDataText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontSize: 16,
  },
});

export default App;