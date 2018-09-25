# Объектно-ориентированное программирование (тестовое задание)
const days = 1000;//prompt("Сколько дней вашей фирме?");
let singletonInstance = null;
let totalNumberOfProjects = 0;
let id = 0;
const daysWithoutWorkLimit=3;
const complexity=[1,2,3];
const recievedProjects=[0,1,2,3,4];

class Project {
    get id() {
        return this._id;
    }
    constructor(complexity,dep) {
        this._id=id+=1;
        this.complexity = complexity;
        this.type=dep.type;
    }
}

class Dev {
    constructor(specialization, project) {
        this.doneProjects = 0;
        this.daysWithoutWork = 0;
        this.project = null;
        this.specialization = specialization;
        this.workProject(project);
    }


    workProject(project, workInTeam) {
        this.project = project;
        this.daysWithoutWork = 0;
        switch (this.specialization) {
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


    completedProjects() {
        this.doneProjects += 1;
        this.project = null;
    }
}

class Dep {
    constructor(type) {
        this.type = type;
        this.devs = [];
        this.testedProjects = [];
        this.workDoneProjects = [];
    }


    chooseFreeDev(value) {
        if (!value)
            return this.devs.find(dev => !dev.project);
        return this.devs.filter(dev => !dev.project);
    }


    projectDistribution(project) {

        if (this.type !== "mobile") {
            const dev = this.chooseFreeDev();
            if (!dev)
                return false;
            dev.workProject(project);
            return true;
        }

        const devs = this.chooseFreeDev(true);

        if (!this.chooseFreeDev(true).length)
            return false;

        if (devs.length < project.complexity)
            devs[0].workProject(project);
        else
            for (let i = 0; i < project.complexity; i += 1)
                devs[i].workProject(project, true);

        return true;
    }


    dayAdding() {
        this.devs.forEach((dev) => {
            const {work, project} = dev;
            if (!project)
                dev.daysWithoutWork += 1;

            if (work)
                dev.work -= 1;

            if (!dev.work && project) {
                if (this.type === "QA")
                    this.workDoneProjects.push(project);
                else if (!this.testedProjects.find(proj => proj.id === project.id))
                    this.testedProjects.push(project);
                dev.completedProjects();
            }
        });
    }


    newDev(dev) {
        this.devs.push(dev);
    }
}


const QA=new Dep("QA");
const web=new Dep("web");
const mobile=new Dep("mobile");


class Firm {


    constructor() {
		if (!singletonInstance) {
        	this.hiredDevs = 0;
        	this.dissmissedDevs = 0;
        	this.departments={web,mobile,QA};
        	this.previousProjects = [];
        	this.testedProjects = [];
			singletonInstance = this;
        }
	return singletonInstance;
    }


    takeProjects(projects) {
        projects.forEach(project => {
            if (!(web||mobile).projectDistribution(project))
                this.previousProjects.push(project);
        });
    }


    dayAdding() {
        this.testedProjects.forEach(project => {
            if (!QA.projectDistribution(project)) {
                QA.newDev(new Dev("QA", project));
                this.hiredDevs += 1;
            }
        });

        this.testedProjects.length=0;

        Object.keys(this.departments).forEach(key => {
            this.departments[key].dayAdding();
        });

        this.previousProjects.forEach(project => {
            (web||mobile).newDev(new Dev((web||mobile), project));
            this.hiredDevs += 1;
        });

        this.previousProjects.length=0;

        Object.keys(this.departments).forEach(key => {
            if (this.departments[key].type !== "QA") {
                this.departments[key].testedProjects.forEach(proj => this.testedProjects.push(proj));
                this.departments[key].testedProjects.length=0;
            }
        });
        this.dismissal();
    }


    dismissal() {
        let goAway;
        let department;

        Object.keys(this.departments).forEach(key => {
            this.departments[key].devs.forEach(dev => {
                if (dev.daysWithoutWork > daysWithoutWorkLimit && (!goAway || goAway.doneProjects > dev.doneProjects)) {
                    goAway = dev;
                    department = dev.specialization;
                }
            });
        });

        if (goAway && department) {
            QA.devs.splice(0);
            web.devs.splice(0);
            mobile.devs.splice(0);
            this.dissmissedDevs += 1;
        }
    }


    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    static createProjects() {
        const projects = [];
        for (let i = 0; i < Firm.random(recievedProjects[0], recievedProjects[4]); i += 1) {
            let x=Firm.random(0,1);
            if(x===0)
                projects.push(new Project(Firm.random(complexity[0], complexity[2]),web));
            else
                projects.push(new Project(Firm.random(complexity[0], complexity[2]),mobile));
        }
        return projects;
    }


    Stat(){
        console.log("Общее количество проектов", totalNumberOfProjects);
        console.log("Количество готовых проектов: ", QA.workDoneProjects.length);
        console.log("Нанятые: ", this.hiredDevs);
        console.log("Уволенные: ", this.dissmissedDevs);
    }
}


function live() {
    const Lodoss = new Firm();
	const Dunice = new Firm();
	console.log((Lodoss==Dunice)?true:false);
    for (let i = 0; i < days; i += 1) {
        const projects = Firm.createProjects();
        totalNumberOfProjects += projects.length;
        Lodoss.takeProjects(projects);
        Lodoss.dayAdding();
    }
    Lodoss.Stat();
}


live();
