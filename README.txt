Cricket Score Analyzer App

The Cricket Score Analyzer app allows users to analyze cricket scores from different countries. 
Users can choose between test data or remote data, enter a country name, and view the average score for that country. 
The app also displays a line chart of average scores by country.

Features --
1. Toggle between Test Data or Server Data.
2. Enter a Country Name to calculate and display the average score.
3. View a Line Chart of average scores per country.
4. Pull-to-refresh functionality to reload data.

Installation --
Node.js (>=14.0.0)
npm (>=6.0.0)
React Native CLI
Android Studio / Xcode (for emulator or device)

Setup -- 
Clone/download the repository.
1. cd react-native-app-1
2. npm install
3. cd ios && pod install && cd ..
4. expo start 

Libraries Used --
react-native-chart-kit: For displaying the line chart.
react-native: Core React Native library.

How It Works --
Data Source: Toggle between Test Data (local) and Server Data (remote API).
Average Calculation: Enter a country to calculate its average score.
Line Chart: Displays average scores by country.
Pull-to-refresh: Reload data when swiping down.

Status --
Working:
Data fetching (Test/Server).
Average score calculation.
Line chart display.
Pull-to-refresh functionality.

Known Issues:
No error handling for invalid country names.
Data is not persisted after app restart.