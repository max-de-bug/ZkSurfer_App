export interface Dictionary {
    home: {
        title: string;
        description: string;
    };
    about: {
        title: string;
        description: string;
    };
    docs: {
        needHelp: string;
        checkDocs: string;
    },
    sidebar: {
        home: string,
        marketplace: string,
        explore: string,
        apiKeys: string,
        agents: {
            title: string,
            noAgents: string
        },
        toggleSidebar: string,
        editProfile: string
    },
    inputPlaceholder: string,
    commands: [
        {
            label: string,
            command: string,
            description: string,
        },
        {
            label: string,
            command: string,
            description: string,
        }
    ]
}