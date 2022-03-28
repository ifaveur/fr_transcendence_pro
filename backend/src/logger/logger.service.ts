import { Global, Injectable } from '@nestjs/common';
/*
			**************
	    TRY THE NEW CUSTOM LOGGER
			**************
	___________________________________
	___________________________________
	_______________USAGE_______________
	___________________________________

	logger('test1', 'FLASH'); flashy output, you will not miss it
	logger('ERROR', 'test2'); red error output
	logger('test3', 'AUTO'); for automatics process, darker to keep your screen clean
	logger('test4', 'random blabla', 'blabla...', '...'); classic output

	You can put one of those 3 keywords where you want to get special output :
	[AUTO] / [FLASH] / [ERROR]
						
	or none of them for classic output 

	___________________________________

*/
@Global()
@Injectable()
export class LoggerService {
	static objCount: number = 0;
	static newLine: number;
	static special: string;


	dbg(...args) {
		LoggerService.newLine = 0;
		LoggerService.special = this.getSpecial(...args);
		this.cursorPos('save');

		this.displayConstructor(...args);

		for (var i = 0; i < args.length; i++) {
			if (typeof args[i] == "string")
				this.displayString(args[i], args.length - (i + 1));
			else
				this.displayObject(args.length - (i + 1), args[i]);
		}
	}

	displayConstructor(...args) {
		const tmp = Error().stack.split('\n')[4].trim().split(' ')[1].split('.');
		const caller0 = '[' + tmp[0] + ']';
		const caller1 = '[' + tmp[1] + '] ';


		if (LoggerService.special == null) {
			process.stdout.write(caller0.dim.cyan);
			if (caller0.indexOf('Service') != -1)
				process.stdout.write(caller1.green);
			else if (caller0.indexOf('Controller') != -1)
				process.stdout.write(caller1.magenta);
			else if (caller0.indexOf('Strategy') != -1)
				process.stdout.write(caller1.yellow);
			else if (caller0.indexOf('Guard') != -1)
				process.stdout.write(caller1.cyan);
			else
				process.stdout.write(caller1.blue);
		} else {
			if (LoggerService.special == 'AUTO')
				process.stdout.write('[background process] '.dim.yellow.italic);
			else if (LoggerService.special == 'FLASH')
				process.stdout.write(caller0.dim.cyan + caller1.rainbow.bold);
			else if (LoggerService.special == 'ERROR')
				process.stdout.write('[ERROR]'.red.bold + caller0.red + caller1.red);
		}
		args.length ? this.cursorPos('save') : process.stdout.write('▸▸▸ \n'.dim.blue);
	}

	displayString(msg: string, size: number) {
		if (this.isSpecial(msg) == true) {
			if (!size && LoggerService.newLine == 0)
				process.stdout.write('\n');
			return ;
		}

		if (LoggerService.newLine) {
			this.cursorPos('restore');
			LoggerService.newLine = 0;
		}

		if (LoggerService.special == 'AUTO')
			process.stdout.write(msg.yellow.dim + ' ')
		else
			process.stdout.write(msg.blue + ' ')
		
		if (!size)
			process.stdout.write('\n');
	}

	displayObject(size: number, ...obj) {
		if (LoggerService.newLine)
			this.cursorPos('restore');
		process.stdout.write('\x1b[1D');

		const reset_color = "\x1b[0m";
		const color = this.nextColor();

		for (var i = 0; i < obj.length; i++) {
			console.log(color, obj[i], reset_color);
		}
		
		LoggerService.objCount++;
		LoggerService.newLine++;
	}

	nextColor() {
		var color = '\x1b[' + 37 + 'm';
		if (LoggerService.objCount % 2 == 0)
			color = '\x1b[' + 36 + 'm';
		color += "\x1b[3m";
		return color;
	}

	cursorPos(mode: string) {
		if (mode == 'restore')
			process.stdout.write('\x1b[u');
		if (mode == 'save')
			process.stdout.write('\x1b[s');
	}

	isSpecial(str: string): boolean {
		if (   str == 'AUTO'
			|| str == 'FLASH'
			|| str == 'ERROR')
			return true;
		return false;
	}

	getSpecial(...args): string {
		if (args.length == 0)
			return null;
		for (var i = 0; i < args.length; i++) {
			if (typeof args[i] != "string")
				continue;
			if (this.isSpecial(args[i]) == true) {
				return args[i];
			}
		}
		return null;
	}

}