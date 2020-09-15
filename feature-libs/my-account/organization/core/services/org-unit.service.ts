import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, queueScheduler } from 'rxjs';
import { filter, map, observeOn, take, tap } from 'rxjs/operators';

import { StateWithOrganization } from '../store/organization-state';
import { OrgUnitActions } from '../store/actions/index';
import {
  getOrgUnit,
  getOrgUnitList,
  getApprovalProcesses,
  getOrgUnitTree,
  getAssignedUsers,
  getB2BAddresses,
  getB2BAddress,
} from '../store/selectors/org-unit.selector';
import {
  B2BUnit,
  B2BUnitNode,
  B2BApprovalProcess,
  B2BUser,
  EntitiesModel,
  B2BAddress,
  CostCenter,
  StateWithProcess,
  AuthService,
  StateUtils,
} from '@spartacus/core';
import { B2BSearchConfig } from '../model/search-config';

const mockedTree1 = {
  active: true,
  children: [
    {
      active: true,
      children: [
        {
          active: true,
          children: [],
          id: 'Services West',
          name: 'Services West',
          parent: 'Rustic Services',
        },
        {
          active: true,
          children: [],
          id: 'Services East',
          name: 'Services East',
          parent: 'Rustic Services',
        },
      ],
      id: 'Rustic Services',
      name: 'Rustic Services',
      parent: 'Rustic',
    },
    {
      active: true,
      children: [
        {
          active: true,
          children: [
            {
              active: true,
              children: [],
              id: 'Test',
              name: 'TestUnit',
              parent: 'Custom Retail',
            },
          ],
          id: 'Custom Retail',
          name: 'Custom Retail',
          parent: 'Rustic Retail',
        },
      ],
      id: 'Rustic Retail',
      name: 'Rustic Retail',
      parent: 'Rustic',
    },
  ],
  id: 'Rustic',
  name: 'Rustic',
};
const mockedTree2 = {
  active: true,
  children: [
    {
      active: true,
      children: [
        {
          active: true,
          children: [
            {
              active: true,
              children: [],
              id: 'GC_TEST_UNIT',
              name: 'GC Test Unit',
              parent: 'Test Name',
            },
          ],
          id: 'Test Name',
          name: 'Test name',
          parent: 'T/T/T',
        },
      ],
      id: 'T/T/T',
      name: 'Test / Test / Test',
      parent: 'Rustic',
    },
    {
      active: true,
      children: [
        {
          active: false,
          children: [
            {
              active: false,
              children: [
                {
                  active: false,
                  children: [],
                  id: 'bill',
                  name: 'bill',
                  parent: 'KParentUnitz',
                },
                {
                  active: false,
                  children: [],
                  id: 'KChildUnit',
                  name: 'K Child Unit',
                  parent: 'KParentUnitz',
                },
              ],
              id: 'KParentUnitz',
              name: 'Very looong unit name',
              parent: 'Rustic Servicesidzzzzxzzzzz',
            },
            {
              active: false,
              children: [
                {
                  active: false,
                  children: [],
                  id: 'hhhh',
                  name: 'hhhhh',
                  parent: 'aaaaa',
                },
              ],
              id: 'aaaaa',
              name: 'aaaaaaa',
              parent: 'Rustic Servicesidzzzzxzzzzz',
            },
            {
              active: false,
              children: [],
              id: 'Services West',
              name: 'Services West',
              parent: 'Rustic Servicesidzzzzxzzzzz',
            },
            {
              active: false,
              children: [],
              id: 'RSUN',
              name: 'Rust Serv Unit Name',
              parent: 'Rustic Servicesidzzzzxzzzzz',
            },
            {
              active: false,
              children: [],
              id: 'Services East',
              name: 'Services East',
              parent: 'Rustic Servicesidzzzzxzzzzz',
            },
          ],
          id: 'Rustic Servicesidzzzzxzzzzz',
          name: 'Rustic Servicesz',
          parent: 'Rustic Retail',
        },
        {
          active: false,
          children: [
            {
              active: false,
              children: [],
              id: 'UR01',
              name: 'UnitRole',
              parent: 'Custom Retail',
            },
          ],
          id: 'Custom Retail',
          name: 'Custom Retail',
          parent: 'Rustic Retail',
        },
        {
          active: false,
          children: [],
          id: '112233',
          name: 'Testing refresh',
          parent: 'Rustic Retail',
        },
      ],
      id: 'Rustic Retail',
      name: 'Rustic Retail',
      parent: 'Rustic',
    },
    {
      active: false,
      children: [],
      id: 'Rustic_Custom_8',
      name: 'Rustic Custom 8',
      parent: 'Rustic',
    },
    {
      active: true,
      children: [],
      id: 'PROU',
      name: 'Pro unit',
      parent: 'Rustic',
    },
    {
      active: false,
      children: [],
      id: 'tobber',
      name: 'Tobber',
      parent: 'Rustic',
    },
    {
      active: false,
      children: [
        {
          active: false,
          children: [],
          id: 'TU',
          name: 'Test Unit',
          parent: 'Unit ID',
        },
      ],
      id: 'Unit ID',
      name: 'Name',
      parent: 'Rustic',
    },
    {
      active: true,
      children: [
        { active: true, children: [], id: 'eeee', name: 'eeee', parent: 'NU' },
      ],
      id: 'NU',
      name: 'Normal unit edited',
      parent: 'Rustic',
    },
    {
      active: false,
      children: [],
      id: 'PUz',
      name: "Patryk's Unitz",
      parent: 'Rustic',
    },
  ],
  id: 'Rustic',
  name: 'Rustic',
};

@Injectable()
export class OrgUnitService {
  constructor(
    protected store: Store<StateWithOrganization | StateWithProcess<void>>,
    protected authService: AuthService
  ) {}

  load(orgUnitId: string): void {
    this.withUserId((userId) =>
      this.store.dispatch(new OrgUnitActions.LoadOrgUnit({ userId, orgUnitId }))
    );
  }

  loadList(): void {
    this.withUserId((userId) =>
      this.store.dispatch(new OrgUnitActions.LoadOrgUnitNodes({ userId }))
    );
  }

  loadTree(): void {
    this.withUserId((userId) =>
      this.store.dispatch(new OrgUnitActions.LoadTree({ userId }))
    );
  }

  loadApprovalProcesses(): void {
    this.withUserId((userId) =>
      this.store.dispatch(new OrgUnitActions.LoadApprovalProcesses({ userId }))
    );
  }

  loadUsers(orgUnitId: string, roleId: string, params: B2BSearchConfig): void {
    this.withUserId((userId) =>
      this.store.dispatch(
        new OrgUnitActions.LoadAssignedUsers({
          userId,
          orgUnitId,
          roleId,
          params,
        })
      )
    );
  }

  loadAddresses(orgUnitId: string): void {
    this.withUserId((userId) => {
      // TODO: replace it after turn on loadAddresses$
      // this.store.dispatch(
      //   new OrgUnitActions.LoadAddresses({ userId, orgUnitId })
      // );
      this.store.dispatch(
        new OrgUnitActions.LoadOrgUnit({ userId, orgUnitId })
      );
    });
  }

  private getOrgUnit(
    orgUnitId: string
  ): Observable<StateUtils.LoaderState<B2BUnit>> {
    return this.store.select(getOrgUnit(orgUnitId));
  }

  private getTreeState(): Observable<StateUtils.LoaderState<B2BUnitNode>> {
    return this.store.select(getOrgUnitTree());
  }

  private getOrgUnitsList(): Observable<StateUtils.LoaderState<B2BUnitNode[]>> {
    return this.store.select(getOrgUnitList());
  }

  private getAddressesState(
    orgUnitId: string
  ): Observable<StateUtils.LoaderState<EntitiesModel<B2BAddress>>> {
    return this.store.select(getB2BAddresses(orgUnitId, null));
  }

  private getAddressState(
    addressId: string
  ): Observable<StateUtils.LoaderState<B2BAddress>> {
    return this.store.select(getB2BAddress(addressId));
  }

  private getAssignedUsers(
    orgUnitId: string,
    roleId: string,
    params: B2BSearchConfig
  ): Observable<StateUtils.LoaderState<EntitiesModel<B2BUser>>> {
    return this.store.select(getAssignedUsers(orgUnitId, roleId, params));
  }

  private getApprovalProcessesList(): Observable<
    StateUtils.LoaderState<B2BApprovalProcess[]>
  > {
    return this.store.select(getApprovalProcesses());
  }

  get(orgUnitId: string): Observable<B2BUnit> {
    return this.getOrgUnit(orgUnitId).pipe(
      observeOn(queueScheduler),
      tap((state) => {
        if (!(state.loading || state.success || state.error)) {
          this.load(orgUnitId);
        }
      }),
      filter((state) => state.success || state.error),
      map((state) => state.value)
    );
  }

  getCostCenters(orgUnitId: string): Observable<EntitiesModel<CostCenter>> {
    return this.get(orgUnitId).pipe(
      map((orgUnit) => ({
        values: orgUnit.costCenters ?? [],
      }))
    );
  }

  protected findUnitChildrenInTree(
    orginitId,
    unit: B2BUnitNode
  ): B2BUnitNode[] {
    return unit.id === orginitId
      ? unit.children
      : unit.children.flatMap((child) =>
          this.findUnitChildrenInTree(orginitId, child)
        );
  }

  getChildUnits(orgUnitId: string): Observable<EntitiesModel<B2BUnitNode>> {
    return this.getTree().pipe(
      map((tree) => ({
        values: this.findUnitChildrenInTree(orgUnitId, tree),
      }))
    );
  }

  getTree(): Observable<B2BUnitNode> {
    return this.getTreeState().pipe(
      observeOn(queueScheduler),
      tap((process: StateUtils.LoaderState<B2BUnitNode>) => {
        if (!(process.loading || process.success || process.error)) {
          this.loadTree();
        }
      }),
      filter(
        (process: StateUtils.LoaderState<B2BUnitNode>) =>
          process.success || process.error
      ),
      // map((result) => result.value)
      map(() => mockedTree1)
    );
  }

  getApprovalProcesses(): Observable<B2BApprovalProcess[]> {
    return this.getApprovalProcessesList().pipe(
      observeOn(queueScheduler),
      tap((process: StateUtils.LoaderState<B2BApprovalProcess[]>) => {
        if (!(process.loading || process.success || process.error)) {
          this.loadApprovalProcesses();
        }
      }),
      filter(
        (process: StateUtils.LoaderState<B2BApprovalProcess[]>) =>
          process.success || process.error
      ),
      map((result) => result.value)
    );
  }

  getList(): Observable<B2BUnitNode[]> {
    return this.getOrgUnitsList().pipe(
      observeOn(queueScheduler),
      tap((process: StateUtils.LoaderState<B2BUnitNode[]>) => {
        if (!(process.loading || process.success || process.error)) {
          this.loadList();
        }
      }),
      filter(
        (process: StateUtils.LoaderState<B2BUnitNode[]>) =>
          process.success || process.error
      ),
      map((result) => result.value)
    );
  }

  getActiveUnitList(): Observable<B2BUnitNode[]> {
    return this.getList().pipe(
      map((units) => units.filter((unit) => unit.active))
    );
  }

  getUsers(
    orgUnitId: string,
    roleId: string,
    params: B2BSearchConfig
  ): Observable<EntitiesModel<B2BUser>> {
    return this.getAssignedUsers(orgUnitId, roleId, params).pipe(
      observeOn(queueScheduler),
      tap((process: StateUtils.LoaderState<EntitiesModel<B2BUser>>) => {
        if (!(process.loading || process.success || process.error)) {
          this.loadUsers(orgUnitId, roleId, params);
        }
      }),
      filter(
        (process: StateUtils.LoaderState<EntitiesModel<B2BUser>>) =>
          process.success || process.error
      ),
      map((result) => result.value)
    );
  }

  create(unit: B2BUnit): void {
    this.withUserId((userId) =>
      this.store.dispatch(new OrgUnitActions.CreateUnit({ userId, unit }))
    );
  }

  update(unitCode: string, unit: B2BUnit): void {
    this.withUserId((userId) =>
      this.store.dispatch(
        new OrgUnitActions.UpdateUnit({ userId, unitCode, unit })
      )
    );
  }

  assignRole(orgCustomerId: string, roleId: string): void {
    this.withUserId((userId) =>
      this.store.dispatch(
        new OrgUnitActions.AssignRole({
          userId,
          orgCustomerId,
          roleId,
        })
      )
    );
  }

  unassignRole(orgCustomerId: string, roleId: string): void {
    this.withUserId((userId) =>
      this.store.dispatch(
        new OrgUnitActions.UnassignRole({
          userId,
          orgCustomerId,
          roleId,
        })
      )
    );
  }

  assignApprover(
    orgUnitId: string,
    orgCustomerId: string,
    roleId: string
  ): void {
    this.withUserId((userId) =>
      this.store.dispatch(
        new OrgUnitActions.AssignApprover({
          orgUnitId,
          userId,
          orgCustomerId,
          roleId,
        })
      )
    );
  }

  unassignApprover(
    orgUnitId: string,
    orgCustomerId: string,
    roleId: string
  ): void {
    this.withUserId((userId) =>
      this.store.dispatch(
        new OrgUnitActions.UnassignApprover({
          orgUnitId,
          userId,
          orgCustomerId,
          roleId,
        })
      )
    );
  }

  createAddress(orgUnitId: string, address: B2BAddress): void {
    this.withUserId((userId) =>
      this.store.dispatch(
        new OrgUnitActions.CreateAddress({
          userId,
          orgUnitId,
          address,
        })
      )
    );
  }

  getAddresses(orgUnitId: string): Observable<EntitiesModel<B2BAddress>> {
    return this.getAddressesState(orgUnitId).pipe(
      observeOn(queueScheduler),
      tap((state) => {
        if (!(state.loading || state.success || state.error)) {
          this.loadAddresses(orgUnitId);
        }
      }),
      filter((state) => state.success || state.error),
      map((state) => state.value)
    );
  }

  getAddress(orgUnitId: string, addressId: string): Observable<B2BAddress> {
    return this.getAddressState(addressId).pipe(
      observeOn(queueScheduler),
      tap((state) => {
        if (!(state.loading || state.success || state.error)) {
          this.loadAddresses(orgUnitId);
        }
      }),
      filter((state) => state.success || state.error),
      map((state) => state.value)
    );
  }

  updateAddress(
    orgUnitId: string,
    addressId: string,
    address: B2BAddress
  ): void {
    this.withUserId((userId) =>
      this.store.dispatch(
        new OrgUnitActions.UpdateAddress({
          userId,
          orgUnitId,
          addressId,
          address,
        })
      )
    );
  }

  deleteAddress(orgUnitId: string, addressId: string): void {
    this.withUserId((userId) =>
      this.store.dispatch(
        new OrgUnitActions.DeleteAddress({
          userId,
          orgUnitId,
          addressId,
        })
      )
    );
  }

  private withUserId(callback: (userId: string) => void): void {
    this.authService
      .getOccUserId()
      .pipe(take(1))
      .subscribe((userId) => callback(userId));
  }
}
