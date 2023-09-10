import List "mo:base/List";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Map "mo:base/HashMap";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Int16 "mo:base/Int16";

actor {
  public type Note = {
    title : Text;
    content : Text;
  };
  public type Notes = List.List<Note>;
  stable var entries : [(Text, Notes)] = [];
  let NotesMap = Map.fromIter<Text, Notes>(entries.vals(), 1, Text.equal, Text.hash);

  var notBad : Note = {
    title = "Warning";
    content = "Code is wrong";
  };

  public query func getNotes() : async [(Text, Notes)] {
    return Iter.toArray(NotesMap.entries());
  };

  public query func getLists(category : Text) : async Notes {
    return Option.get(NotesMap.get(category), List.nil<Note>());
  };

  public func addNote(category : Text, title : Text, content : Text) {
    let tempList : Notes = await getLists(category);
    let NewNote : Note = {
      title = title;
      content = content;
    };
    NotesMap.put(category, List.push(NewNote, tempList));
  };

  public func removeNote(id : Nat, category : Text) {
    let tempList : Notes = await getLists(category);
    let listFront = List.take(tempList, id);
    let listBack = List.drop(tempList, id + 1);
    NotesMap.put(category, List.append(listFront, listBack));
  };

  public func addCategory(category : Text) {
    NotesMap.put(category, List.nil<Note>());
  };

  public func swapCategory(categoryS : Text, categoryE : Text, idS : Nat, idE : Nat) {
    let tempListS : Notes = await getLists(categoryS);
    let tempListE : Notes = await getLists(categoryE);

    let listFrontS = List.take(tempListS, idS);
    let listBackS = List.drop(tempListS, idS +1);
    let noteDrag : Note = Option.get(List.get<Note>(tempListS, idS), notBad);

    let listFrontE = List.take(tempListE, idE);
    let listBackE = List.drop(tempListE, idE);
    let listBackEf = List.push(noteDrag, listBackE);
    NotesMap.put(categoryS, List.append(listFrontS, listBackS));
    NotesMap.put(categoryE, List.append(listFrontE, listBackEf));
  };
  public func topCategory(categoryS : Text, categoryE : Text, id : Nat) {
    let tempList : Notes = await getLists(categoryS);
    let listFrontS = List.take(tempList, id);
    let listBackS = List.drop(tempList, id +1);
    let noteDrag : Note = Option.get(List.get<Note>(tempList, id), notBad);
    addNote(categoryE, noteDrag.title, noteDrag.content);
    NotesMap.put(categoryS, List.append(listFrontS, listBackS));
  };

  system func preupgrade() {
    entries := Iter.toArray(NotesMap.entries());
  };

  system func postupgrade() {
    entries := [];
  };

};
