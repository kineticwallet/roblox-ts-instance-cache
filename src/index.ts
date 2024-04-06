import { HttpService, Workspace } from "@rbxts/services";
import { InstanceTree, validateTree } from "@rbxts/validate-tree";

export class InstanceCache<T extends Instance> {
	private template: T;
	private tree: InstanceTree;
	private cache: T[];
	private location: Instance;
	private id = HttpService.GenerateGUID(false);

	private createDefaultLocation(location?: Instance): Instance {
		if (typeIs(location, "Instance")) return location;
		const folder = new Instance("Folder");
		folder.Name = `${tostring(this)}_${this.id}`;
		folder.Parent = Workspace;
		return folder;
	}

	private parentToLocation(instance: T, location?: Instance): T {
		if (!typeIs(location, "Instance")) return instance;
		instance.Parent = location;
		return instance;
	}

	public constructor(template: T, tree: InstanceTree, location?: Instance, amount = 0) {
		this.template = template;
		this.tree = tree;
		this.location = this.createDefaultLocation(location);
		this.cache = new Array<T>(amount);

		for (const i of $range(1, amount)) {
			const instance = this.template.Clone();
			this.parentToLocation(instance, location);
			this.cache.push(instance);
		}
	}

	public Get(location?: Instance): T {
		const cacheInstance = this.cache.pop();
		if (cacheInstance) {
			return this.parentToLocation(cacheInstance, location);
		}
		const instance = this.template.Clone();
		return this.parentToLocation(instance, location);
	}

	public Return(instance: T): boolean {
		if (typeIs(instance, "Instance")) return false;
		if (!validateTree(instance, this.tree, [])) return false;
		this.cache.push(this.parentToLocation(instance, this.location));
		return true;
	}

	public Flush(): void {
		this.cache.clear();
	}

	public Destroy(): void {
		this.Flush();
		table.clear(this);
		setmetatable(this, undefined!);
	}
}
