import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import {
  CLI_PRODUCT_CONFIGURATOR_FEATURE,
  LibraryOptions as SpartacusProductConfiguratorOptions,
  SpartacusOptions,
  SPARTACUS_PRODUCT_CONFIGURATOR_RULEBASED,
} from '@spartacus/schematics';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');
const appModulePath = 'src/app/app.module.ts';

describe('Spartacus product configurator schematics: ng-add', () => {
  const schematicRunner = new SchematicTestRunner('schematics', collectionPath);

  let appTree: UnitTestTree;

  const workspaceOptions: any = {
    name: 'workspace',
    version: '0.5.0',
  };

  const appOptions: any = {
    name: 'schematics-test',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: 'scss',
    skipTests: false,
    projectRoot: '',
  };

  const defaultOptions: SpartacusProductConfiguratorOptions = {
    project: 'schematics-test',
    lazy: true,
    features: [CLI_PRODUCT_CONFIGURATOR_FEATURE],
  };

  const spartacusDefaultOptions: SpartacusOptions = {
    project: 'schematics-test',
  };

  beforeEach(async () => {
    schematicRunner.registerCollection(
      '@spartacus/schematics',
      '../../projects/schematics/src/collection.json'
    );
    schematicRunner.registerCollection(
      '@spartacus/organization',
      '../../feature-libs/organization/schematics/collection.json'
    );

    appTree = await schematicRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'workspace',
        workspaceOptions
      )
      .toPromise();
    appTree = await schematicRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        appOptions,
        appTree
      )
      .toPromise();
    appTree = await schematicRunner
      .runExternalSchematicAsync(
        '@spartacus/schematics',
        'ng-add',
        { ...spartacusDefaultOptions, name: 'schematics-test' },
        appTree
      )
      .toPromise();
  });

  describe('Product config feature', () => {
    describe('styling', () => {
      beforeEach(async () => {
        appTree = await schematicRunner
          .runSchematicAsync('ng-add', defaultOptions, appTree)
          .toPromise();
      });

      it('should install @spartacus/product-configuration library', () => {
        const packageJson = appTree.readContent('package.json');
        expect(packageJson).toContain(SPARTACUS_PRODUCT_CONFIGURATOR_RULEBASED);
      });

      it('should add style import to /src/styles/spartacus/product-configurator.scss', async () => {
        const content = appTree.readContent(
          '/src/styles/spartacus/product-configurator.scss'
        );
        expect(content).toEqual(`@import "@spartacus/product-configurator";`);
      });

      it('should add update angular.json with spartacus/product-configurator.scss', async () => {
        const content = appTree.readContent('/angular.json');
        const angularJson = JSON.parse(content);
        const buildStyles: string[] =
          angularJson.projects['schematics-test'].architect.build.options
            .styles;
        expect(buildStyles).toEqual([
          'src/styles.scss',
          'src/styles/spartacus/product-configurator.scss',
        ]);

        const testStyles: string[] =
          angularJson.projects['schematics-test'].architect.test.options.styles;
        expect(testStyles).toEqual([
          'src/styles.scss',
          'src/styles/spartacus/product-configurator.scss',
        ]);
      });
    });

    describe('eager loading', () => {
      beforeEach(async () => {
        appTree = await schematicRunner
          .runSchematicAsync(
            'ng-add',
            { ...defaultOptions, lazy: false },
            appTree
          )
          .toPromise();
      });

      it('should add product-configurator deps', async () => {
        const packageJson = appTree.readContent('/package.json');
        const packageObj = JSON.parse(packageJson);
        const depPackageList = Object.keys(packageObj.dependencies);
        expect(
          depPackageList.includes('@spartacus/product-configurator/rulebased')
        ).toBe(true);
      });

      it('should import appropriate modules', async () => {
        const appModule = appTree.readContent(appModulePath);
        expect(appModule).toContain(
          `import { RulebasedConfiguratorRootModule } from '@spartacus/product-configurator/rulebased/root';`
        );
      });

      it('should not contain lazy loading syntax', async () => {
        const appModule = appTree.readContent(appModulePath);
        expect(appModule).not.toContain(
          `import('@spartacus/product-configurator/rulebased').then(`
        );
      });
    });

    describe('lazy loading', () => {
      beforeEach(async () => {
        appTree = await schematicRunner
          .runSchematicAsync('ng-add', defaultOptions, appTree)
          .toPromise();
      });

      it('should import rulebased root module and contain the lazy loading syntax', async () => {
        const appModule = appTree.readContent(appModulePath);
        expect(appModule).toContain(
          `import { RulebasedConfiguratorRootModule } from '@spartacus/product-configurator/rulebased/root';`
        );
        expect(appModule).toContain(
          `import('@spartacus/product-configurator/rulebased').then(`
        );
      });

      it('should not contain the rulebase module import', () => {
        const appModule = appTree.readContent(appModulePath);
        expect(appModule).not.toContain(
          `import { RulebasedConfiguratorModule } from '@spartacus/product-configurator/rulebased';`
        );
      });
    });
    describe('i18n', () => {
      beforeEach(async () => {
        appTree = await schematicRunner
          .runSchematicAsync('ng-add', defaultOptions, appTree)
          .toPromise();
      });

      it('should import the i18n resource and chunk from assets', async () => {
        const appModule = appTree.readContent(appModulePath);
        expect(appModule).toContain(
          `import { productConfiguratorTranslations } from '@spartacus/product-configurator/assets';`
        );
        expect(appModule).toContain(
          `import { productConfiguratorTranslationChunksConfig } from '@spartacus/product-configurator/assets';`
        );
      });
      it('should provideConfig', async () => {
        const appModule = appTree.readContent(appModulePath);
        expect(appModule).toContain(
          `resources: productConfiguratorTranslations,`
        );
        expect(appModule).toContain(
          `chunks: productConfiguratorTranslationChunksConfig,`
        );
      });
    });
  });

  describe('when other Spartacus features are already installed', () => {
    beforeEach(async () => {
      appTree = await schematicRunner
        .runExternalSchematicAsync(
          '@spartacus/organization',
          'ng-add',
          { ...spartacusDefaultOptions, name: 'schematics-test' },
          appTree
        )
        .toPromise();
      appTree = await schematicRunner
        .runSchematicAsync('ng-add', defaultOptions, appTree)
        .toPromise();
    });

    it('should just append storefinder feature without duplicating the featureModules config', () => {
      const appModule = appTree.readContent(appModulePath);
      expect(appModule.match(/featureModules:/g).length).toEqual(1);
      expect(appModule).toContain(`rulebased: {`);
    });
  });
});
