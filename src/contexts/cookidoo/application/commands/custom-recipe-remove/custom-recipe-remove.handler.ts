import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CustomRecipeRemoveCommand } from './custom-recipe-remove.command';

@CommandHandler(CustomRecipeRemoveCommand)
export class CustomRecipeRemoveCommandHandler implements ICommandHandler<CustomRecipeRemoveCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(command: CustomRecipeRemoveCommand): Promise<void> {
    await this.client.removeCustomRecipe(command.id);
  }
}
