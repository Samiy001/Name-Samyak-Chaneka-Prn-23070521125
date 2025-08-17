// Weightings for each round
const roundWeights = {
    round1: 0.3,   // 30% weight
    round2: 0.4,   // 40% weight
    round3: 0.3    // 30% weight
};

// Categories for Round 3 (will be randomized on load)
const round3Categories = [
    { name: "Innovation", bonus: 3 },
    { name: "Creativity", bonus: 2 },
    { name: "Execution", bonus: 4 },
    { name: "Presentation", bonus: 2 },
    { name: "Teamwork", bonus: 1 }
];

// Array to store all teams
let teams = [];

// DOM elements
const form = document.getElementById('performanceForm');
const round1Input = document.getElementById('round1');
const round1Value = document.getElementById('round1Value');
const round3CategorySelect = document.getElementById('round3Category');
const teamsContainer = document.getElementById('teamsContainer');
const resetBtn = document.getElementById('resetBtn');
const datetimeElement = document.getElementById('datetime');

// Initialize the page
function init() {
    // Update the range input display
    round1Input.addEventListener('input', function() {
        round1Value.textContent = this.value;
    });

    // Populate Round 3 categories (randomized order)
    populateRound3Categories();

    // Set up form submission
    form.addEventListener('submit', handleFormSubmit);

    // Set up reset button
    resetBtn.addEventListener('click', resetForm);

    // Update datetime in footer
    updateDateTime();
    setInterval(updateDateTime, 1000); // Update every second
}

// Populate Round 3 categories in random order
function populateRound3Categories() {
    // Clear existing options
    round3CategorySelect.innerHTML = '';

    // Shuffle the categories array
    const shuffledCategories = [...round3Categories].sort(() => Math.random() - 0.5);

    // Add options to select element
    shuffledCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        round3CategorySelect.appendChild(option);
    });
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();

    // Get form values
    const teamName = document.getElementById('teamName').value.trim();
    const teamId = document.getElementById('teamId').value;
    const round1Score = parseInt(round1Input.value);
    const round2Score = parseInt(document.getElementById('round2').value);
    const round3Category = round3CategorySelect.value;

    // Validate inputs
    if (!validateInputs(teamName, teamId, round1Score, round2Score)) {
        return;
    }

    // Find bonus points for the selected category
    const categoryInfo = round3Categories.find(cat => cat.name === round3Category);
    const categoryBonus = categoryInfo ? categoryInfo.bonus : 0;

    // Calculate weighted scores
    const weightedRound1 = round1Score * roundWeights.round1;
    const weightedRound2 = round2Score * roundWeights.round2;
    
    // For Round 3, we'll use a fixed score based on the category (for simplicity)
    // In a real app, this would be another input
    const round3Score = 70 + (categoryBonus * 5); // Base score plus scaled bonus
    const weightedRound3 = round3Score * roundWeights.round3;

    // Calculate total score
    let totalScore = weightedRound1 + weightedRound2 + weightedRound3;

    // Add bonus points if Round 2 score > 80
    if (round2Score > 80) {
        totalScore += 5;
    }

    // Calculate grade
    const grade = calculateGrade(totalScore);

    // Get remark based on grade
    const remark = getRemark(grade);

    // Create team object
    const team = {
        name: teamName,
        id: teamId,
        round1: round1Score,
        round2: round2Score,
        round3Category: round3Category,
        round3Score: round3Score,
        totalScore: totalScore,
        grade: grade,
        remark: remark
    };

    // Add to teams array
    teams.push(team);

    // Update display
    updateTeamsDisplay();

    // Reset form (but keep categories randomized)
    form.reset();
    round1Value.textContent = "50";

    // Add flip animation to the form
    form.classList.add('card-flip');
    setTimeout(() => {
        form.classList.remove('card-flip');
    }, 1000);
}

// Validate form inputs
function validateInputs(teamName, teamId, round1Score, round2Score) {
    // Check if team name is from actual classmates (simplified for this example)
    const validTeamNames = ["Tech Titans", "Code Crusaders", "Data Wizards", "Pixel Pioneers", "Byte Brigade"];
    if (!validTeamNames.includes(teamName)) {
        alert("Please enter a valid team name from our class clubs: Tech Titans, Code Crusaders, Data Wizards, Pixel Pioneers, Byte Brigade");
        return false;
    }

    // Check if PRN is valid (simplified check for length)
    if (teamId.length !== 11) {
        alert("Please enter a valid 11-digit PRN");
        return false;
    }

    // Check score ranges
    if (round1Score < 0 || round1Score > 100 || round2Score < 0 || round2Score > 100) {
        alert("Scores must be between 0 and 100");
        return false;
    }

    return true;
}

// Calculate grade based on total score
function calculateGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    return 'F';
}

// Get remark based on grade
function getRemark(grade) {
    switch (grade) {
        case 'A': return 'Outstanding';
        case 'B': return 'Strong';
        case 'C': return 'Average';
        case 'F': return 'Needs Improvement';
        default: return '';
    }
}

// Update the teams display
function updateTeamsDisplay() {
    // Clear existing cards
    teamsContainer.innerHTML = '';

    // If no teams, show message
    if (teams.length === 0) {
        teamsContainer.innerHTML = '<p>No teams added yet. Submit a team to see results.</p>';
        return;
    }

    // Find the highest score
    let highestScore = Math.max(...teams.map(team => team.totalScore));
    let highestScorers = teams.filter(team => team.totalScore === highestScore);

    // If tie, use tie-breaker (first letter of team name)
    let winningTeam = highestScorers[0]; // default to first if no tie
    if (highestScorers.length > 1) {
        // Sort alphabetically by team name and pick first
        winningTeam = highestScorers.sort((a, b) => 
            a.name.localeCompare(b.name))[0];
    }

    // Create cards for each team
    teams.forEach(team => {
        const card = document.createElement('div');
        card.className = 'team-card';
        
        // Highlight the winning team
        if (team === winningTeam) {
            card.classList.add('highlight');
        }

        // Add grade class for color coding
        const gradeClass = `grade-${team.grade}`;

        card.innerHTML = `
            <h3>${team.name}</h3>
            <p><strong>Team ID:</strong> ${team.id}</p>
            <p><strong>Round 1:</strong> ${team.round1} (weighted: ${(team.round1 * roundWeights.round1).toFixed(1)})</p>
            <p><strong>Round 2:</strong> ${team.round2} (weighted: ${(team.round2 * roundWeights.round2).toFixed(1)})</p>
            <p><strong>Round 3 Category:</strong> ${team.round3Category}</p>
            <p><strong>Round 3 Score:</strong> ${team.round3Score} (weighted: ${(team.round3Score * roundWeights.round3).toFixed(1)})</p>
            <p><strong>Total Score:</strong> ${team.totalScore.toFixed(1)}</p>
            <p><strong>Grade:</strong> <span class="${gradeClass}">${team.grade}</span></p>
            <p><strong>Remark:</strong> ${team.remark}</p>
        `;

        teamsContainer.appendChild(card);
    });
}

// Reset the form and all teams
function resetForm() {
    form.reset();
    round1Value.textContent = "50";
    teams = [];
    updateTeamsDisplay();
    populateRound3Categories(); // Re-randomize categories
}

// Update datetime in footer
function updateDateTime() {
    const now = new Date();
    datetimeElement.textContent = now.toLocaleString();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);