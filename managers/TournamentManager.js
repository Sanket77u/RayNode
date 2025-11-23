const fs = require('fs');
const path = require('path');

class TournamentManager {
    constructor() {
        this.dataFile = path.join(__dirname, '../tournaments.json');
        this.tournaments = this.loadTournaments();
    }

    loadTournaments() {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = fs.readFileSync(this.dataFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading tournaments:', error);
        }
        return {};
    }

    saveTournaments() {
        try {
            fs.writeFileSync(this.dataFile, JSON.stringify(this.tournaments, null, 2));
        } catch (error) {
            console.error('Error saving tournaments:', error);
        }
    }

    createTournament(name) {
        const tournamentKey = name.toLowerCase();
        if (this.tournaments[tournamentKey]) {
            return { success: false, message: 'Tournament already exists!' };
        }

        this.tournaments[tournamentKey] = {
            name: name,
            squads: [],
            matches: [],
            createdAt: new Date().toISOString()
        };
        this.saveTournaments();
        return { success: true, message: `Tournament "${name}" created successfully!` };
    }

    addSquad(tournamentName, playerIds) {
        const tournamentKey = tournamentName.toLowerCase();
        if (!this.tournaments[tournamentKey]) {
            return { success: false, message: 'Tournament not found!' };
        }

        this.tournaments[tournamentKey].squads = playerIds;
        this.saveTournaments();
        return { success: true, message: `Squad added to "${tournamentName}" with ${playerIds.length} players!` };
    }

    getTournament(name) {
        return this.tournaments[name.toLowerCase()];
    }

    getAllTournaments() {
        return this.tournaments;
    }

    deleteTournament(name) {
        const tournamentKey = name.toLowerCase();
        if (!this.tournaments[tournamentKey]) {
            return { success: false, message: 'Tournament not found!' };
        }

        delete this.tournaments[tournamentKey];
        this.saveTournaments();
        return { success: true, message: `Tournament "${name}" deleted successfully!` };
    }
}

module.exports = TournamentManager;
