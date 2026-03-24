import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

module {

  public type UserRole = {
    #admin;
    #user;
    #guest;
  };

  public type AccessControlState = {
    userRoles : Map.Map<Principal, UserRole>;
  };

  // 🔐 Replace this with your actual admin Principal
  let BOOTSTRAP_ADMIN : Principal = Principal.fromText("zzjv7-cyfrc-qaz3p-44qsn-7g4zk-uwhni-vtsvd-dsgri-cup3t-kzkyd-lae");

  public func initState() : AccessControlState {
    let state = {
      userRoles = Map.empty<Principal, UserRole>();
    };

    // Assign bootstrap admin at deployment time
    state.userRoles.add(BOOTSTRAP_ADMIN, #admin);

    state;
  };

  // Optional secure initialization (can be used for extra validation)
  public func initialize(
    state : AccessControlState,
    caller : Principal,
    adminToken : Text,
    userProvidedToken : Text
  ) {
    if (caller.isAnonymous()) { return };

    switch (state.userRoles.get(caller)) {
      case (?_) {
        // Already registered
      };
      case (null) {
        // Optional: allow bootstrap admin to validate token if needed
        if (caller == BOOTSTRAP_ADMIN and userProvidedToken == adminToken) {
          state.userRoles.add(caller, #admin);
        } else {
          state.userRoles.add(caller, #user);
        };
      };
    };
  };

  public func getUserRole(state : AccessControlState, caller : Principal) : UserRole {
    if (caller.isAnonymous()) { return #guest };

    switch (state.userRoles.get(caller)) {
      case (?role) { role };
      case (null) {
        Runtime.trap("User is not registered");
      };
    };
  };

  public func assignRole(
    state : AccessControlState,
    caller : Principal,
    user : Principal,
    role : UserRole
  ) {
    if (not isAdmin(state, caller)) {
      Runtime.trap("Unauthorized: Only admins can assign user roles");
    };

    state.userRoles.add(user, role);
  };

  public func hasPermission(
    state : AccessControlState,
    caller : Principal,
    requiredRole : UserRole
  ) : Bool {
    let userRole = getUserRole(state, caller);

    if (userRole == #admin or requiredRole == #guest) {
      true;
    } else {
      userRole == requiredRole;
    };
  };

  public func isAdmin(state : AccessControlState, caller : Principal) : Bool {
    getUserRole(state, caller) == #admin;
  };

};
