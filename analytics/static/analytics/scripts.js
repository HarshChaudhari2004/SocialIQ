// Fetch CSV Data
d3.csv("/static/analytics/social-media-analytics.csv").then(function(data) {
  // Variables to store processed values
  const dates = [];
  const likes = [];
  const comments = [];
  const shares = [];
  const postDistribution = {
    static: 0,
    reel: 0,
    carousel: 0,
  };

  data.forEach(function(d) {
    const postType = d.Type.toLowerCase(); // Access correct column name 'Type'

    // Populate categories
    dates.push(d.Date); // Access correct column name 'Date'
    likes.push(+d.Likes); // Access correct column name 'Likes'
    comments.push(+d.Comments); // Access correct column name 'Comments'
    shares.push(+d.Shares); // Access correct column name 'Shares'

    // Count posts by type
    postDistribution[postType] = (postDistribution[postType] || 0) + 1;
  });

  // Default date range: from 01-01-2024 to 31-03-2024
  const defaultStartDate = "2024-01-01";
  const defaultEndDate = "2024-03-31";

  // Set the default date range
  document.getElementById("start-date").value = defaultStartDate;
  document.getElementById("end-date").value = defaultEndDate;

  // Generate Post Distribution Chart
  c3.generate({
    bindto: '#post-distribution-chart',
    data: {
      columns: [
        ['Static', postDistribution.static],
        ['Reel', postDistribution.reel],
        ['Carousel', postDistribution.carousel]
      ],
      type: 'pie',
      colors: {
        Static: '#007bff',
        Reel: '#28a745',
        Carousel: '#dc3545'
      }
    },
    tooltip: {
      contents: function (d) {
        return `<div style="background-color: #000; color: #fff; padding: 5px; border-radius: 5px;">
                  <strong style="color:${d[0].color}">${d[0].name}</strong>: ${d[0].value}
                </div>`;
      }
    }
  });

  // Function to filter data based on selected date range
  function filterDataByDateRange(startDate, endDate) {
    const filteredData = {
      dates: [],
      likes: [],
      comments: [],
      shares: []
    };

    // Filter data based on selected date range
    data.forEach(function(d) {
      const postDate = d.Date;
      if (postDate >= startDate && postDate <= endDate) {
        filteredData.dates.push(postDate);
        filteredData.likes.push(+d.Likes);
        filteredData.comments.push(+d.Comments);
        filteredData.shares.push(+d.Shares);
      }
    });

    return filteredData;
  }

  // Function to filter and aggregate data by post type and date range
  function filterDataByTypeAndDate(postType, startDate, endDate) {
    const aggregatedData = new Map();
    
    data.forEach(function(d) {
      if (d.Date >= startDate && d.Date <= endDate) {
        if (postType === 'all' || d.Type.toLowerCase() === postType) {
          if (!aggregatedData.has(d.Date)) {
            aggregatedData.set(d.Date, {
              likes: 0,
              comments: 0,
              shares: 0,
              count: 0
            });
          }
          const daily = aggregatedData.get(d.Date);
          daily.likes += +d.Likes;
          daily.comments += +d.Comments;
          daily.shares += +d.Shares;
          daily.count++;
        }
      }
    });

    const filtered = {
      dates: [],
      likes: [],
      comments: [],
      shares: []
    };

    aggregatedData.forEach((value, date) => {
      filtered.dates.push(date);
      // If all types selected, show average per day
      if (postType === 'all') {
        filtered.likes.push(Math.round(value.likes / value.count));
        filtered.comments.push(Math.round(value.comments / value.count));
        filtered.shares.push(Math.round(value.shares / value.count));
      } else {
        filtered.likes.push(value.likes);
        filtered.comments.push(value.comments);
        filtered.shares.push(value.shares);
      }
    });

    return filtered;
  }

  // Generate Engagement Over Time Chart
  function generateEngagementChart(filteredData) {
    c3.generate({
      bindto: '#engagement-over-time-chart',
      data: {
        x: 'x',
        columns: [
          ['x', ...filteredData.dates],
          ['Likes', ...filteredData.likes],
          ['Comments', ...filteredData.comments],
          ['Shares', ...filteredData.shares]
        ],
        types: {
          Likes: 'spline',
          Comments: 'spline',
          Shares: 'spline'
        },
        colors: {
          Likes: '#1f77b4',
          Comments: '#ff7f0e',
          Shares: '#2ca02c'
        }
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            rotate: 90,
            multiline: false,
            format: '%Y-%m-%d',
            count: Math.ceil(filteredData.dates.length / 7) // Show tick every 7 days
          }
        },
        y: {
          label: {
            text: 'Engagement Count',
            position: 'outer-middle'
          }
        }
      },
      padding: {
        left: 100 // Add more padding for y-axis label
      },
      interaction: {
        enabled: true
      },
      tooltip: {
        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
          let tooltipContent = `<div style="background-color: #000; color: #fff; padding: 5px; border-radius: 5px;">
                                  <strong>${defaultTitleFormat(d[0].x)}</strong>`;
          d.forEach(item => {
            tooltipContent += `<br><span style="color:${color(item)}">${item.name}</span>: ${item.value}`;
          });
          tooltipContent += `</div>`;
          return tooltipContent;
        }
      }
    });
  }

  // Add this after the existing data processing code
  function calculateAverageEngagement(data) {
    const engagementByType = {
      static: { likes: 0, comments: 0, shares: 0, count: 0 },
      reel: { likes: 0, comments: 0, shares: 0, count: 0 },
      carousel: { likes: 0, comments: 0, shares: 0, count: 0 }
    };

    data.forEach(d => {
      const type = d.Type.toLowerCase();
      engagementByType[type].likes += +d.Likes;
      engagementByType[type].comments += +d.Comments;
      engagementByType[type].shares += +d.Shares;
      engagementByType[type].count++;
    });

    return Object.entries(engagementByType).map(([type, stats]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      avgLikes: Math.round(stats.likes / stats.count),
      avgComments: Math.round(stats.comments / stats.count),
      avgShares: Math.round(stats.shares / stats.count)
    }));
  }

  // Generate Post Comparison Chart
  function generateComparisonChart(data) {
    const avgEngagement = calculateAverageEngagement(data);
    
    c3.generate({
      bindto: '#post-comparison-chart',
      data: {
        columns: [
          ['Likes', ...avgEngagement.map(d => d.avgLikes)],
          ['Comments', ...avgEngagement.map(d => d.avgComments)],
          ['Shares', ...avgEngagement.map(d => d.avgShares)]
        ],
        type: 'bar'
    },
    bar: {
        width: {
            ratio: 0.5 // this makes bar width 50% of length between ticks
        }
      },
      axis: {
        x: {
          type: 'category',
          categories: avgEngagement.map(d => d.type)
        },
        y: {
          label: {
            text: 'Average Count',
            position: 'outer-middle'
          }
        }
      },
      bar: {
        width: {
          ratio: 0.7 // this makes bar width 70% of length between ticks
        }
      },
      padding: {
        top: 5,

      },
      tooltip: {
        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
          let tooltipContent = `<div style="background-color: #000; color: #fff; padding: 5px; border-radius: 5px;">
                                  <strong>${defaultTitleFormat(d[0].x)}</strong>`;
          d.forEach(item => {
            tooltipContent += `<br><span style="color:${color(item)}">${item.name}</span>: ${item.value}`;
          });
          tooltipContent += `</div>`;
          return tooltipContent;
        }
      }
    });
  }

  // Populate Data Preview Table
  function populateDataTable(data) {
    const tbody = document.querySelector('#data-table tbody');
    const previewData = data.slice(0, 100); // Show first 100 rows

    tbody.innerHTML = previewData.map(row => `
      <tr>
        <td>${row['Post ID']}</td>
        <td>${row.Type}</td>
        <td>${row.Date}</td>
        <td>${row.Likes}</td>
        <td>${row.Shares}</td>
        <td>${row.Comments}</td>
      </tr>
    `).join('');
  }

  // Populate Engagement Summary by Post Type
  function populateEngagementSummaryByType(postType) {
    const summaryLikes = document.getElementById('summary-likes');
    const summaryComments = document.getElementById('summary-comments');
    const summaryShares = document.getElementById('summary-shares');

    let filteredData = data;
    if (postType !== 'all') {
      filteredData = data.filter(d => d.Type.toLowerCase() === postType);
    }

    const totalLikes = filteredData.reduce((a, b) => a + (+b.Likes), 0);
    const totalComments = filteredData.reduce((a, b) => a + (+b.Comments), 0);
    const totalShares = filteredData.reduce((a, b) => a + (+b.Shares), 0);

    summaryLikes.textContent = totalLikes.toLocaleString();
    summaryComments.textContent = totalComments.toLocaleString();
    summaryShares.textContent = totalShares.toLocaleString();
  }

  // Populate Engagement Summary
  function populateEngagementSummary() {
    const totalLikes = data.reduce((a, b) => a + (+b.Likes), 0);
    const totalComments = data.reduce((a, b) => a + (+b.Comments), 0);
    const totalShares = data.reduce((a, b) => a + (+b.Shares), 0);

    document.getElementById('total-likes').textContent = totalLikes.toLocaleString();
    document.getElementById('total-comments').textContent = totalComments.toLocaleString();
    document.getElementById('total-shares').textContent = totalShares.toLocaleString();
  }

  // Update event listeners
  function updateCharts() {
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;
    const postType = document.getElementById("post-type").value;
    const filteredData = filterDataByTypeAndDate(postType, startDate, endDate);
    generateEngagementChart(filteredData);
    generateComparisonChart(data);
    populateEngagementSummary(); // Add this line to update the summary
  }

  function updateEngagementSummaryByType() {
    const selectedType = document.getElementById("summary-post-type").value;
    populateEngagementSummaryByType(selectedType);
  }

  // Event listeners
  document.getElementById("start-date").addEventListener("change", updateCharts);
  document.getElementById("end-date").addEventListener("change", updateCharts);
  document.getElementById("post-type").addEventListener("change", updateCharts);
  document.getElementById("summary-post-type").addEventListener("change", updateEngagementSummaryByType);

  // Initial chart generation
  updateCharts();
  populateEngagementSummary(); // Add this line to populate the summary initially
  populateEngagementSummaryByType('reel'); // Default selection

  // Populate Data Preview Table
  populateDataTable(data);
});