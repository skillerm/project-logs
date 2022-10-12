import * as vscode from 'vscode';
import * as chokidar from 'chokidar';
import FileController from './controllers/FileController';
import UtilsController from './controllers/UtilsController';

var Loaded = false;

/**
 * ProjectLogs
 * 
 * @description An extension for Visual Studio. Have full control of your 
 * projects, editing/creating new files.
 * @author Eduardo Castro <Skillerm>
 * @version 1.0.0
 */
var ProjectLogs;

export function activate(context: vscode.ExtensionContext) {

	//console.log('Congratulations, your extension "project-logs" is now active!');

	/**
	 * Folder
	 * @description Get courrent path of the folder
	 * @return string
	 */
	const Folder = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0].substring(1) ?? "UNDEFINED";

	/**
	 * NameLogs
	 * @description Get name of the folder logs, is project-logs-date
	 * @return string
	 */
	const NameLogs = UtilsController.GenerateLogName(Folder);


	ProjectLogs = vscode.commands.registerCommand('project-logs.init', () => {

		// Doesn't let the project start more than once
		if (Loaded) {
			vscode.window.showInformationMessage('Project Logs already initialized!');
			return;
		}

		Loaded = true;

		// Create folder to logs
		FileController.CreateLogsFolder(NameLogs);

		// Create file Txt Contain all files in project
		FileController.CreateInitFile(Folder, NameLogs, UtilsController.GetDate());

		/**
		 * Watcher
		 * 
		 * @param Folder
		 * @description Watch all files in folder
		 */
		var watcher = chokidar.watch(Folder, { ignored: /^\./, persistent: true });


		watcher.on('add', function (path, stats) {

			/**
			 * @note Every time Chokidar starts it reads all files as new files, for
			 * now my method was to save all current files in a txt and do a check
			 */

			path = path.replace(/\\/g, "/");

			// Check if file is in folder logs
			if (path.indexOf('project-logs') == -1 && !FileController.FindStrInTextFile(NameLogs + '/init-' + UtilsController.GetDate() + '.txt', path)) {
				FileController.CreateNew(path, NameLogs, Folder) // --> Or copy :p
				vscode.window.showInformationMessage('New file added in project-logs');
			}
		})

			.on('change', function (path) {
				path = path.replace(/\\/g, "/");
				if (path.indexOf('project-logs') == -1) { // --> Ignore files edited in folders contain project-logs
					FileController.CreateNew(path, NameLogs, Folder) // --> Or copy :p
					vscode.window.showInformationMessage('File changed in project-logs');
				}
			})
		//.on('unlink', function (path) { console.log('File', path, 'has been removed'); })
		//.on('error', function (error) { console.error('Error happened', error); })


		vscode.window.showInformationMessage('Project Logs Loaded!');
	})
	
	context.subscriptions.push(ProjectLogs);

}

// This method is called when your extension is deactivated
export function deactivate() {
	vscode.window.showInformationMessage('Project Logs Unloaded!');
}
