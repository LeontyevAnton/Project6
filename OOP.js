const days = prompt("Сколько дней вашей фирме?");
let tmp = null;
let tasksN = 0;
let count = 0;

function Random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createTasks() {
    const tasks = [];
    for (let i = 0; i < Random(0, 4); i += 1) {
        tasks.push(new Project(Random(0, 1), Random(1, 3)));
    }
    return tasks;
}

function live() {
    const director = new Boss("Никита Ващенко","Lodoss Team");
    for (let i = 0; i < days; i += 1) {
        const tasks = createTasks();
        tasksN += tasks.length;
        director.takeTasks(tasks);
        director.dayAdding();
    }
    console.log("Название фирмы:", director.firm);
    console.log("Директор:", director.name)
    console.log("Общее количество проектов", tasksN);
    console.log("Уволенные: ", director.lazyDevelopers);
    console.log("Нанятые: ", director.newDevelopers);
    console.log("Количество готовых проектов: ", director.departments.QA.workDoneProjects.length);

}

class Project {
    constructor(type, complexity) {
        this.id = count+=1;
        this.type = type ? "web" : "mobile";
        this.complexity = complexity;
    }
}

class Developer {
    constructor(type, project) {
        this.doneProjects = 0;
        this.freeDays = 0;
        this.project = null;
        this.type = type;
        this.workProject(project);
    }

    workProject(project, workInTeam) {
        this.project = project;
        this.freeDays = 0;
        switch (this.type) {
            case "web":
                this.work = project.complexity;
                break;
            case "mobile":
                this.work = workInTeam ? 1 : project.complexity;
                break;
            default:
                this.work = 1;
        }
    }

    realizedProjects() {
        this.doneProjects += 1;
        this.project = null;
    }
}

class Department {
    constructor(type) {
        this.type = type;
        this.developers = [];
        this.testProjects = [];

        if (type === "QA") {
            this.workDoneProjects = [];
        }
    }

    findFreeDeveloper(value) {
        if (!value)
            return this.developers.find(developer => !developer.project);
        return this.developers.map(developer => {
            if (!developer.project)
                return developer;
            return false;
        }).filter(a => a);
    }

    projectDistribution(project) {

        if (project.type !== "mobile" || this.type !== "mobile") {
            const developer = this.findFreeDeveloper();
            if (!developer)
                return false;
            developer.workProject(project);
            return true;
        }

        const developers = this.findFreeDeveloper(true);
        if (!developers.length)
            return false;

        if (developers.length < project.complexity)
            developers[0].workProject(project);
        else
            for (let i = 0; i < project.complexity; i += 1)
                developers[i].workProject(project, true);
        return true;
    }

    dayAdding() {
        this.developers.forEach((developer) => {
            const {work, project} = developer;
            if (!project)
                developer.freeDays += 1;

            if (work)
                developer.work -= 1;

            if (!developer.work && project) {
                if (this.type === "QA")
                    this.workDoneProjects.push(project);
                else if (!this.testProjects.find(proj => proj.id === project.id))
                    this.testProjects.push(project);
                developer.realizedProjects();
            }
        });
    }

    newJunior(developer) {
        this.developers.push(developer);
    }
}

class Boss {
    constructor(name,firm) {
        if (!tmp) {
            this.firm=firm;
            this.name = name;
            this.newDevelopers = 0;
            this.lazyDevelopers = 0;
            this.departments = {
                web: new Department("web"),
                mobile: new Department("mobile"),
                QA: new Department("QA")
            };
            this.pastTasks = [];
            this.testProjects = [];
            tmp = this;
        }
        return tmp;
    }

    takeTasks(tasks) {
        tasks.forEach(task => {
            if (!this.departments[task.type].projectDistribution(task))
                this.pastTasks.push(task);
        });
    }

    dayAdding() {
        this.testProjects.forEach(project => {
            if (!this.departments.QA.projectDistribution(project)) {
                this.departments.QA.newJunior(new Developer("QA", project));
                this.newDevelopers += 1;
            }
        });

        this.testProjects.length=0;

        Object.keys(this.departments).forEach(key => {
            this.departments[key].dayAdding();
        });

        this.pastTasks.forEach(task => {
            this.departments[task.type].newJunior(new Developer(task.type, task));
            this.newDevelopers += 1;
        });

        this.pastTasks.length=0;

        Object.keys(this.departments).forEach(key => {
            if (this.departments[key].type !== "QA") {
                this.departments[key].testProjects.forEach(proj => this.testProjects.push(proj));
                this.departments[key].testProjects.length=0;
            }
        });
        this.dismissal();
    }

    dismissal() {
        let goAway;
        let department;

        Object.keys(this.departments).forEach(key => {
            this.departments[key].developers.forEach(developer => {
                if (developer.freeDays > 3 && (!goAway || goAway.doneProjects > developer.doneProjects)) {
                    goAway = developer;
                    department = developer.type;
                }
            });
        });

        if (goAway && department) {
            this.departments[department].developers.splice(0);
            this.lazyDevelopers += 1;
        }
    }
}

live();
